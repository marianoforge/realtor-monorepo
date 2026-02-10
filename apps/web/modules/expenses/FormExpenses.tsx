import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import ModalOK from "@/components/PrivateComponente/CommonComponents/Modal";
import Input from "@/components/PrivateComponente/FormComponents/Input";
import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import { Expense, ExpenseFormData } from "@gds-si/shared-types";
import { useUserDataStore } from "@/stores/userDataStore";
import { createExpense } from "@/lib/api/expensesApi";
import { getSchema } from "@gds-si/shared-schemas/formExpensesSchema";
import { expenseTypeOptions } from "@/lib/data";
import useUserAuth from "@/common/hooks/useUserAuth";
import useModal from "@/common/hooks/useModal";
import { QueryKeys } from "@gds-si/shared-utils";

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

const FormularioExpenses: React.FC = () => {
  const userID = useUserAuth();
  const { userData } = useUserDataStore();
  const router = useRouter();

  const { isOpen: isModalOpen, closeModal } = useModal();
  const [modalMessage] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCurrency, setUserCurrency] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const queryClient = useQueryClient();
  const role = userData?.role;
  const currency = userData?.currency;

  useEffect(() => {
    if (userID) {
      setUserRole(role ?? null);
      setUserCurrency(currency ?? null);
    }
  }, [role, userID, currency]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: yupResolver(getSchema(userCurrency)),
    defaultValues: {
      date: "",
      isRecurring: false,
    },
  });

  const selectedExpenseType = watch("expenseType");
  const date = watch("date");
  const amount = watch("amount");
  const dollarRate = watch("dollarRate");

  const amountInDollars = React.useMemo(() => {
    const numAmount = amount ? Number(amount) : 0;
    const numDollarRate = dollarRate ? Number(dollarRate) : 1;

    if (numAmount === 0 || numDollarRate <= 0) return "0";
    return (numAmount / numDollarRate).toFixed(2);
  }, [amount, dollarRate]);

  const mutation = useMutation({
    mutationFn: (expenseData: Expense) => createExpense(expenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPENSES] });
      showToast("success", "Gasto guardado exitosamente");
      reset();
      setTimeout(() => {
        router.push("/expenses");
      }, 2000);
    },
    onError: (error) => {
      const axiosError = error as AxiosError;
      console.error(
        "Mutation error:",
        axiosError.response?.data || axiosError.message
      );

      let errorMessage = "Error al guardar el gasto";
      if (axiosError.response?.status === 400) {
        errorMessage = "Datos inválidos. Verifica la información ingresada";
      } else if (axiosError.response?.status === 500) {
        errorMessage = "Error del servidor. Inténtalo más tarde";
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      showToast("error", errorMessage);
    },
  });

  const onSubmit: SubmitHandler<ExpenseFormData> = (data: ExpenseFormData) => {
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

    if (userCurrency === "USD" && (!data.dollarRate || data.dollarRate <= 0)) {
      showToast(
        "error",
        "La cotización del dólar es obligatoria y debe ser mayor a 0"
      );
      return;
    }

    if (!userID) {
      showToast("error", "No se proporcionó un ID de usuario válido");
      return;
    }

    const numAmount = data.amount ? Number(data.amount) : 0;
    const numDollarRate = data.dollarRate ? Number(data.dollarRate) : 1;
    const calculatedAmountInDollars =
      numAmount > 0 && numDollarRate > 0 ? numAmount / numDollarRate : 0;

    const expenseData: Expense = {
      date: data.date,
      amount: numAmount,
      amountInDollars: calculatedAmountInDollars,
      otherType: data.otherType ?? "",
      expenseType: data.expenseType,
      description: data.description ?? "",
      dollarRate: numDollarRate,
      user_uid: userID ?? "",
      isRecurring: data.isRecurring ?? false,
    };

    mutation.mutate(expenseData);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header profesional y moderno */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Registrar Nuevo Gasto
                  </h1>
                  <p className="text-orange-100">
                    Agrega un nuevo gasto a tu registro empresarial
                  </p>
                </div>
              </div>
            </div>

            {userRole ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Sección: Información General */}
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
                        defaultValue={date}
                        {...register("date")}
                        error={errors.date?.message}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <TextArea
                        label="Descripción"
                        placeholder="Ej: Gastos de oficina, marketing, viáticos..."
                        {...register("description")}
                        error={errors.description?.message}
                        required
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Valores y Montos */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <CurrencyDollarIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Valores y Montos
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="Monto"
                        type="number"
                        placeholder="1000000"
                        {...register("amount")}
                        error={errors.amount?.message}
                        required
                        showTooltip={true}
                        tooltipContent="Ingrese el monto total del gasto en moneda local"
                        className="w-full"
                      />
                    </div>
                    {userCurrency === "USD" && (
                      <>
                        <div>
                          <Input
                            label="Cotización del Dólar"
                            type="number"
                            placeholder="1250"
                            {...register("dollarRate")}
                            error={errors.dollarRate?.message}
                            required
                            showTooltip={true}
                            tooltipContent="Cotización del dólar al momento del gasto. Si el gasto está en dólares, ingrese 1"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <Input
                            label="Monto en Dólares"
                            type="text"
                            value={amountInDollars}
                            readOnly
                            className="w-full bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Sección: Categorización */}
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
                        options={expenseTypeOptions}
                        register={register}
                        name="expenseType"
                        error={errors.expenseType?.message}
                        required
                      />
                    </div>
                    {selectedExpenseType === "Otros" && (
                      <div>
                        <Input
                          label="Especifica el tipo de gasto"
                          type="text"
                          placeholder="Especifica el tipo de gasto"
                          {...register("otherType")}
                          error={errors.otherType?.message}
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
                  <button
                    type="button"
                    onClick={() => router.push("/expenses")}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? "Guardando..." : "Guardar Gasto"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación (mantenido para compatibilidad) */}
      <ModalOK
        isOpen={isModalOpen}
        onClose={closeModal}
        message={modalMessage}
        onAccept={() => router.push("/expenses")}
      />

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

export default FormularioExpenses;
