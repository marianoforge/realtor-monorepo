import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import { Expense } from "@gds-si/shared-types";
import { updateExpense } from "@/lib/api/expensesApi";
import { expenseTypeOptions } from "@/lib/data";
import { schema } from "@gds-si/shared-schemas/expensesModalSchema";
import { QueryKeys } from "@gds-si/shared-utils";
import { useUserDataStore } from "@/stores/userDataStore";

type FormData = yup.InferType<typeof schema>;

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: (Expense & { id?: string }) | null;
  onExpenseUpdate: (updatedExpense: Expense & { id: string }) => void;
}

const Toast: React.FC<{
  type: "success" | "error";
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(
        () => {
          onClose();
        },
        type === "error" ? 4000 : 3000
      );
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-md">
      <div
        className={`
          transform transition-all duration-500 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          ${
            type === "success"
              ? "bg-green-50 border-l-4 border-green-400"
              : "bg-red-50 border-l-4 border-red-400"
          }
          p-4 rounded-lg shadow-lg border
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            ) : (
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  type === "success"
                    ? "text-green-500 hover:bg-green-100 focus:ring-green-600"
                    : "text-red-500 hover:bg-red-100 focus:ring-red-600"
                }
              `}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const queryClient = useQueryClient();
  const { userData } = useUserDataStore();
  const currency = userData?.currency;

  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: expense || {},
  });

  useEffect(() => {
    if (expense) {
      reset({
        ...expense,
        date: expense.date
          ? new Date(expense.date).toISOString().split("T")[0]
          : "",
      });
    }
  }, [expense, reset]);

  const mutation = useMutation({
    mutationFn: (updatedExpense: Expense) => updateExpense(updatedExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPENSES] });
      showToast("success", "Gasto actualizado exitosamente");
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (error: Error & { response?: { status?: number } }) => {
      console.error("Error updating expense:", error);

      let errorMessage = "Error al actualizar el gasto";

      if (error.response?.status === 400) {
        errorMessage = "Datos inválidos. Verifica la información ingresada";
      } else if (error.response?.status === 404) {
        errorMessage = "Gasto no encontrado";
      } else if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Inténtalo más tarde";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast("error", errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.date) {
      showToast("error", "La fecha del gasto es obligatoria");
      return;
    }

    if (!data.amount || data.amount <= 0) {
      showToast("error", "El monto es obligatorio y debe ser mayor a 0");
      return;
    }

    if (!data.description?.trim()) {
      showToast("error", "La descripción es obligatoria");
      return;
    }

    if (!data.expenseType) {
      showToast("error", "Debe seleccionar el tipo de gasto");
      return;
    }

    if (currency === "USD" && (!data.dollarRate || data.dollarRate <= 0)) {
      showToast(
        "error",
        "La cotización del dólar es obligatoria y debe ser mayor a 0"
      );
      return;
    }

    if (!expense?.id) {
      showToast("error", "ID del gasto no encontrado");
      return;
    }

    mutation.mutate({
      ...data,
      id: expense.id,
      amountInDollars: data.amount / (data.dollarRate || 1),
      user_uid: expense.user_uid,
      otherType: data.otherType ?? "",
      isRecurring: data.isRecurring ?? false,
    });
  };

  if (!isOpen || !expense) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Editar Gasto</h2>
                  <p className="text-orange-100 text-sm">
                    Modifica la información del gasto
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                type="button"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Información General
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Fecha del Gasto"
                      type="date"
                      {...register("date")}
                      error={errors.date?.message}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      label="Descripción"
                      type="text"
                      placeholder="Ej: Gastos de oficina, marketing, etc."
                      {...register("description")}
                      error={errors.description?.message}
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Valores y Montos
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Monto"
                      type="number"
                      placeholder="1000000"
                      step="any"
                      {...register("amount")}
                      error={errors.amount?.message}
                      required
                      className="w-full"
                    />
                  </div>
                  {currency === "USD" && (
                    <div>
                      <Input
                        label="Cotización del dólar"
                        type="number"
                        placeholder="1250"
                        step="any"
                        {...register("dollarRate")}
                        error={errors.dollarRate?.message}
                        required
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Categorización
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select
                      label="Tipo de Gasto"
                      options={expenseTypeOptions.map((type) => ({
                        value: type.value,
                        label: type.label,
                      }))}
                      register={register}
                      name="expenseType"
                      error={errors.expenseType?.message}
                      required
                    />
                  </div>
                  {watch("expenseType") === "Otros" && (
                    <div>
                      <Input
                        label="Especifica el tipo de gasto"
                        type="text"
                        placeholder="Especifica el tipo de gasto"
                        {...register("otherType")}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Sección: Configuración Adicional */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDaysIcon className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Configuración Adicional
                  </h3>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      {...register("isRecurring")}
                      className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <label
                      htmlFor="isRecurring"
                      className="ml-3 text-gray-700 font-medium"
                    >
                      Repetir Mensualmente
                    </label>
                  </div>
                  <div className="ml-2 cursor-help group relative">
                    <span className="flex items-center justify-center w-5 h-5 bg-orange-600 text-white rounded-full text-xs font-bold">
                      ?
                    </span>
                    <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-3 w-64 -ml-32 mt-2 z-10 shadow-lg">
                      Al activar esta opción, este gasto se repetirá
                      automáticamente cada mes con los mismos datos.
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Component */}
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
};

export default ExpensesModal;
