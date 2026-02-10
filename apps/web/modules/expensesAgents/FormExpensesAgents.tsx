import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

import ModalOK from "@/components/PrivateComponente/CommonComponents/Modal";
import Input from "@/components/PrivateComponente/FormComponents/Input";
import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import {
  Expense,
  ExpenseAgentsFormData,
  TeamMember,
} from "@gds-si/shared-types";
import { useUserDataStore } from "@/stores/userDataStore";
import { schema } from "@gds-si/shared-schemas/formAgentsExpensesSchema";
import useUserAuth from "@/common/hooks/useUserAuth";
import useModal from "@/common/hooks/useModal";
import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import { useAddExpenseToAgent } from "@/common/hooks/useAddExpenseToAgent";

const FormExpensesAgents: React.FC = () => {
  const userID = useUserAuth();
  const { userData } = useUserDataStore();
  const router = useRouter();

  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const [modalMessage, setModalMessage] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<"egreso" | "ingreso">(
    "egreso"
  );

  const role = userData?.role;

  const { data: teamMembers, isLoading: isTeamMembersLoading } =
    useTeamMembers();

  useEffect(() => {
    if (userID) {
      setUserRole(role ?? null);
    }
  }, [role, userID]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ExpenseAgentsFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: "",
    },
  });

  const amount = watch("amount");
  const dollarRate = watch("dollarRate");
  const date = watch("date");

  const addExpenseToAgent = useAddExpenseToAgent(() => {
    setModalMessage(
      `${operationType === "egreso" ? "Gasto" : "Ingreso"} registrado al agente exitosamente`
    );
    openModal();
    reset();
  });

  const onSubmit: SubmitHandler<ExpenseAgentsFormData> = (
    data: ExpenseAgentsFormData
  ) => {
    if (!userID) {
      setModalMessage("No se proporcionó un ID de usuario válido");
      openModal();
      return;
    }

    const amountInDollars =
      data.amount && data.dollarRate ? data.amount / data.dollarRate : 0;

    const expenseData: Expense = {
      date: data.date,
      amount: data.amount ?? 0,
      amountInDollars,
      otherType: data.otherType ?? "",
      expenseType: data.expenseType,
      description: data.description ?? "",
      dollarRate: data.dollarRate,
      operationType: operationType,
    };

    addExpenseToAgent.mutate({
      agentId: data.teamMember,
      expense: expenseData,
    });
  };

  const amountInDollars =
    amount && dollarRate ? (amount / dollarRate).toFixed(2) : 0;

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
                    Registrar Operación de Asesor
                  </h1>
                  <p className="text-orange-100">
                    Registra ingresos o egresos relacionados con tus asesores
                  </p>
                </div>
              </div>
            </div>

            {userRole ? (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Sección: Tipo de Operación */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <TagIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tipo de Operación
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setOperationType("egreso")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        operationType === "egreso"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowDownIcon className="w-5 h-5" />
                        <span className="font-semibold">Egreso</span>
                      </div>
                      <p className="text-sm mt-1">
                        Préstamo o gasto hacia el asesor
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperationType("ingreso")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
                        operationType === "ingreso"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowUpIcon className="w-5 h-5" />
                        <span className="font-semibold">Ingreso</span>
                      </div>
                      <p className="text-sm mt-1">
                        Dinero que ingresa del asesor
                      </p>
                    </button>
                  </div>
                </div>

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
                        label={`Fecha del ${operationType === "egreso" ? "Egreso" : "Ingreso"}`}
                        type="date"
                        defaultValue={date}
                        {...register("date")}
                        error={errors.date?.message}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        label={`Concepto del ${operationType === "egreso" ? "Egreso" : "Ingreso"}`}
                        type="text"
                        placeholder={
                          operationType === "egreso"
                            ? "Ej: Préstamo, Adelanto, Gastos"
                            : "Ej: Pago de comisión, Devolución, Aporte"
                        }
                        {...register("expenseType")}
                        error={errors.expenseType?.message}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <TextArea
                      label="Descripción"
                      placeholder={`Describe los detalles de este ${operationType}...`}
                      {...register("description")}
                      error={errors.description?.message}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg font-medium placeholder-gray-400 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-vertical"
                    />
                  </div>
                </div>

                {/* Sección: Asesor */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <UserIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Asesor
                    </h3>
                  </div>
                  <div>
                    {isTeamMembersLoading ? (
                      <div className="space-y-2 py-4">
                        {Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="h-10 bg-gray-200 rounded animate-pulse"
                            ></div>
                          ))}
                      </div>
                    ) : (
                      <Select
                        label="Asesor"
                        options={teamMembers?.map((member: TeamMember) => ({
                          value: member.id,
                          label: member.firstName + " " + member.lastName,
                        }))}
                        register={register}
                        name="teamMember"
                        error={errors.teamMember?.message}
                        required
                      />
                    )}
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
                        tooltipContent="Ingrese el monto total en moneda local"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        label="Cotización del Dólar"
                        type="number"
                        placeholder="1250"
                        {...register("dollarRate")}
                        error={errors.dollarRate?.message}
                        required
                        showTooltip={true}
                        tooltipContent="Cotización del dólar al momento de la operación. Si está en dólares, ingrese 1"
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
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/expenses-agents")}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-sm ${
                      operationType === "egreso"
                        ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    }`}
                  >
                    Registrar Operación
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

      {/* Modal de confirmación */}
      <ModalOK
        isOpen={isModalOpen}
        onClose={closeModal}
        message={modalMessage}
        onAccept={() => router.push("/expenses-agents-form")}
      />
    </>
  );
};

export default FormExpensesAgents;
