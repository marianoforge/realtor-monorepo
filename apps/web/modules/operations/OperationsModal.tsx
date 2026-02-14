import React, { useEffect, useState, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";
import { calculateHonorarios, safeDateToYYYYMMDD } from "@gds-si/shared-utils";
import { schema } from "@gds-si/shared-schemas/operationsFormSchema";
import { updateOperation } from "@/lib/api/operationsApi";
import { TeamMember, UserData } from "@gds-si/shared-types";
import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import { useUserDataStore } from "@/stores/userDataStore";
import { operationTypes, propertyTypes } from "@/lib/data";
import Toast, {
  useToast,
} from "@/components/PrivateComponente/CommonComponents/Toast";
import AddressAutocompleteManual from "@/components/PrivateComponente/PlacesComponents/AddressAutocomplete";
import { UserRole } from "@gds-si/shared-utils";

import ModalSectionWrapper, {
  FormSkeletonGrid,
} from "./components/ModalSectionWrapper";
import { AddressData } from "./components";

type FormData = InferType<typeof schema>;

interface OperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: (FormData & { id: string; user_uid: string }) | null;
  onUpdate: () => void;
  currentUser: UserData;
}

const OperationsModal: React.FC<OperationsModalProps> = ({
  isOpen,
  onClose,
  operation,
  onUpdate,
  currentUser,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    shouldFocusError: false,
    defaultValues: {
      estado: "En Curso",
      punta_compradora: false,
      punta_vendedora: false,
      fecha_operacion: "",
      direccion_reserva: "",
      reparticion_honorarios_asesor: 0,
      localidad_reserva: null,
      provincia_reserva: null,
      exclusiva: false,
      no_exclusiva: false,
      realizador_venta: "",
      realizador_venta_adicional: "",
      porcentaje_honorarios_asesor: null,
      porcentaje_honorarios_asesor_adicional: null,
    } as FormData,
  });

  const [addressData, setAddressData] = useState<AddressData>({
    address: "",
    city: null,
    province: null,
    country: null,
    houseNumber: "",
  });

  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);
  const [porcentajeHonorariosBroker, setPorcentajeHonorariosBroker] =
    useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();
  const { data: teamMembers, isLoading: isTeamMembersLoading } =
    useTeamMembers();
  const { userData } = useUserDataStore();
  const userRole = userData?.role;

  const { toastVisible, toastType, toastMessage, showToast, hideToast } =
    useToast();

  const usersMapped = [
    ...(teamMembers?.map((member: TeamMember) => ({
      name: `${member.firstName} ${member.lastName}`,
      uid: member.id, // Siempre usar el ID del documento en teams para consistencia
    })) || []),
    ...(currentUser.uid
      ? [
          {
            name:
              `${currentUser.firstName} ${currentUser?.lastName}` ||
              "Logged User",
            uid: currentUser.uid,
          },
        ]
      : []),
  ];

  const currentUserName =
    `${currentUser.firstName} ${currentUser?.lastName}` || "Logged User";
  const isTeamLeaderPrimaryAdvisor =
    watch("realizador_venta") === currentUserName;
  const isTeamLeaderAdditionalAdvisor =
    watch("realizador_venta_adicional") === currentUserName;
  const isTeamLeaderBroker = userRole === UserRole.TEAM_LEADER_BROKER;

  const tipoOperacion = watch("tipo_operacion");
  const isAlquiler =
    tipoOperacion === "Alquiler Tradicional" ||
    tipoOperacion === "Alquiler Temporal" ||
    tipoOperacion === "Alquiler Comercial";

  useEffect(() => {
    if (operation && isOpen) {
      const exclusivaValue = operation.exclusiva === true;
      const noExclusivaValue = operation.no_exclusiva === true;

      // Determinar valores de puntas - asegurar que al menos uno esté marcado para no-Compra
      let puntaCompradora = Boolean(operation.punta_compradora);
      let puntaVendedora = Boolean(operation.punta_vendedora);
      // Si es una operación que no sea Compra y ninguna punta está marcada, inferir de los porcentajes
      if (
        operation.tipo_operacion !== "Compra" &&
        !puntaCompradora &&
        !puntaVendedora
      ) {
        if ((operation.porcentaje_punta_compradora || 0) > 0)
          puntaCompradora = true;
        if ((operation.porcentaje_punta_vendedora || 0) > 0)
          puntaVendedora = true;
        // Si aún no hay ninguna, marcar vendedora por defecto para Venta
        if (
          !puntaCompradora &&
          !puntaVendedora &&
          operation.tipo_operacion === "Venta"
        ) {
          puntaVendedora = true;
        }
      }

      const formattedOperation = {
        ...operation,
        fecha_captacion: safeDateToYYYYMMDD(operation.fecha_captacion),
        fecha_reserva: safeDateToYYYYMMDD(operation.fecha_reserva),
        fecha_operacion: safeDateToYYYYMMDD(operation.fecha_operacion),
        fecha_vencimiento_alquiler: safeDateToYYYYMMDD(
          operation.fecha_vencimiento_alquiler
        ),
        porcentaje_punta_compradora: operation.porcentaje_punta_compradora || 0,
        porcentaje_punta_vendedora: operation.porcentaje_punta_vendedora || 0,
        realizador_venta: operation.realizador_venta || "",
        realizador_venta_adicional: operation.realizador_venta_adicional || "",
        porcentaje_honorarios_asesor:
          operation.porcentaje_honorarios_asesor || 0,
        porcentaje_honorarios_asesor_adicional:
          operation.porcentaje_honorarios_asesor_adicional || 0,
        exclusiva: exclusivaValue,
        no_exclusiva: noExclusivaValue,
        punta_compradora: puntaCompradora,
        punta_vendedora: puntaVendedora,
      };
      reset(formattedOperation);

      setAddressData({
        address: operation.direccion_reserva || "",
        city: operation.localidad_reserva || null,
        province: operation.provincia_reserva || null,
        country:
          ((operation as Record<string, unknown>).pais as string) || null,
        houseNumber: operation.numero_casa || "",
      });
      setShowAdditionalAdvisor(!!operation.realizador_venta_adicional);
    }
  }, [operation, reset, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setShowAdditionalAdvisor(false);
      setAddressData({
        address: "",
        city: null,
        province: null,
        country: null,
        houseNumber: "",
      });
    }
  }, [isOpen, reset]);

  useEffect(() => {
    const porcentaje_punta_compradora =
      parseFloat(String(watch("porcentaje_punta_compradora"))) || 0;
    const porcentaje_punta_vendedora =
      parseFloat(String(watch("porcentaje_punta_vendedora"))) || 0;
    setPorcentajeHonorariosBroker(
      porcentaje_punta_compradora + porcentaje_punta_vendedora
    );
  }, [
    watch("porcentaje_punta_compradora"),
    watch("porcentaje_punta_vendedora"),
    watch,
  ]);

  useEffect(() => {
    if (isOpen && operation && !isTeamMembersLoading) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [isOpen, operation, isTeamMembersLoading]);

  const mutation = useMutation({
    mutationFn: updateOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      queryClient.invalidateQueries({
        queryKey: ["operations", operation?.user_uid],
      });
      showToast("success", "Cambio guardado exitosamente");
      onUpdate();
      setTimeout(onClose, 1000);
    },
    onError: (error: Error | unknown) => {
      console.error("Error updating operation:", error);
      let errorMessage = "Error al guardar los cambios";

      if (error instanceof Error && error?.message) {
        if (
          error.message.includes("network") ||
          error.message.includes("Network")
        ) {
          errorMessage =
            "Error de conexión. Verifica tu internet y vuelve a intentar";
        } else if (error.message.includes("permission")) {
          errorMessage = "No tienes permisos para realizar esta acción";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      showToast("error", errorMessage);
    },
  });

  const validateRequiredFields = useCallback(
    (data: FormData): string | null => {
      if (!data.fecha_reserva) return "La fecha de reserva es obligatoria";
      if (!data.valor_reserva || data.valor_reserva <= 0) {
        return "El valor de reserva es obligatorio y debe ser mayor a 0";
      }
      if (!data.tipo_operacion) return "El tipo de operación es obligatorio";
      if (!addressData.address)
        return "La dirección de la propiedad es obligatoria";
      return null;
    },
    [addressData.address]
  );

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (!operation) return;

      const validationError = validateRequiredFields(data);
      if (validationError) {
        showToast("error", validationError);
        return;
      }

      const selectedUser = usersMapped.find(
        (m) => m.name === data.realizador_venta
      );
      const assignedUserUID = selectedUser ? selectedUser.uid : null;

      const selectedUserAdicional = usersMapped.find(
        (m) => m.name === data.realizador_venta_adicional
      );
      const assignedUserUIDAdicional = selectedUserAdicional
        ? selectedUserAdicional.uid
        : null;

      let porcentajeHonorariosAsesor = data.porcentaje_honorarios_asesor || 0;
      if (isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker) {
        porcentajeHonorariosAsesor = 100;
      }

      let porcentajeHonorariosAsesorAdicional =
        data.porcentaje_honorarios_asesor_adicional || 0;
      if (isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker) {
        porcentajeHonorariosAsesorAdicional = 100;
      }

      const honorarios = calculateHonorarios(
        data.valor_reserva,
        porcentajeHonorariosAsesor,
        porcentajeHonorariosBroker,
        data.porcentaje_compartido || 0,
        data.porcentaje_referido || 0
      );

      const operationData: Record<string, unknown> = {
        ...data,
        fecha_captacion: safeDateToYYYYMMDD(data.fecha_captacion),
        fecha_reserva: safeDateToYYYYMMDD(data.fecha_reserva),
        fecha_operacion: safeDateToYYYYMMDD(data.fecha_operacion),
        fecha_vencimiento_alquiler: safeDateToYYYYMMDD(
          data.fecha_vencimiento_alquiler
        ),
        direccion_reserva: addressData.address || "",
        localidad_reserva: addressData.city || "",
        provincia_reserva: addressData.province || "",
        honorarios_asesor: honorarios.honorariosAsesor,
        honorarios_broker: honorarios.honorariosBroker,
        porcentaje_honorarios_broker: porcentajeHonorariosBroker,
        porcentaje_honorarios_asesor: porcentajeHonorariosAsesor,
        porcentaje_honorarios_asesor_adicional:
          porcentajeHonorariosAsesorAdicional,
        user_uid: assignedUserUID,
        user_uid_adicional: assignedUserUIDAdicional,
        numero_casa: addressData.houseNumber || "",
        pais: addressData.country || "",
        reparticion_honorarios_asesor: data.reparticion_honorarios_asesor || 0,
        exclusiva: data.exclusiva ? true : !data.no_exclusiva ? "N/A" : false,
        no_exclusiva: data.no_exclusiva
          ? true
          : !data.exclusiva
            ? "N/A"
            : false,
        captacion_no_es_mia:
          (data as Record<string, unknown>).captacion_no_es_mia || false,
      };

      await mutation.mutateAsync({ id: operation.id, data: operationData });
    } catch (error) {
      console.error("Error updating operation:", error);
      showToast("error", "Error inesperado al procesar la operación");
    }
  };

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => {
      if (prev) {
        setValue("realizador_venta_adicional", "");
        setValue("porcentaje_honorarios_asesor_adicional", 0);
      }
      return !prev;
    });
  };

  const sortedUsers = [...usersMapped].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  if (!isOpen || !operation) return null;

  return (
    <>
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={hideToast}
      />

      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 mx-auto p-0 border w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[70%] shadow-lg rounded-xl bg-white max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
            <h2 className="text-2xl font-bold">Editar Operación</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {isLoading ? (
              <FormSkeletonGrid count={12} />
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                {/* Información General */}
                <ModalSectionWrapper title="INFORMACIÓN GENERAL">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha de Captación / Publicación"
                      type="date"
                      {...register("fecha_captacion")}
                      error={errors.fecha_captacion?.message}
                    />
                    <Input
                      label="Fecha de Reserva / Promesa*"
                      type="date"
                      {...register("fecha_reserva")}
                      error={errors.fecha_reserva?.message}
                      required
                    />
                    <Input
                      label="Fecha de Cierre"
                      type="date"
                      {...register("fecha_operacion", {
                        setValueAs: (v) => v || null,
                      })}
                      error={errors.fecha_operacion?.message}
                    />
                    <div>
                      <Select
                        label="Tipo de Operación*"
                        options={operationTypes}
                        register={register}
                        name="tipo_operacion"
                        error={errors.tipo_operacion?.message}
                      />
                      {errors.tipo_operacion && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tipo_operacion.message}
                        </p>
                      )}
                    </div>
                    {(tipoOperacion === "Venta" ||
                      tipoOperacion === "Compra") && (
                      <div>
                        <Select
                          label="Tipo de Inmueble*"
                          options={propertyTypes}
                          register={register}
                          name="tipo_inmueble"
                          error={errors.tipo_inmueble?.message}
                        />
                        {errors.tipo_inmueble && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.tipo_inmueble.message}
                          </p>
                        )}
                      </div>
                    )}
                    {isAlquiler && (
                      <Input
                        label="Fecha de Vencimiento del Alquiler"
                        type="date"
                        {...register("fecha_vencimiento_alquiler")}
                        error={errors.fecha_vencimiento_alquiler?.message}
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-[#0077b6] block mb-3">
                      Exclusividad de la Operación
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="exclusividad-modal"
                          checked={watch("exclusiva") === true}
                          onChange={() => {
                            setValue("exclusiva", true, {
                              shouldValidate: true,
                            });
                            setValue("no_exclusiva", false, {
                              shouldValidate: true,
                            });
                          }}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 focus:ring-[#0077b6]"
                        />
                        <span className="text-gray-700">Exclusiva</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="exclusividad-modal"
                          checked={watch("no_exclusiva") === true}
                          onChange={() => {
                            setValue("exclusiva", false, {
                              shouldValidate: true,
                            });
                            setValue("no_exclusiva", true, {
                              shouldValidate: true,
                            });
                          }}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 focus:ring-[#0077b6]"
                        />
                        <span className="text-gray-700">No Exclusiva</span>
                      </label>
                    </div>
                  </div>
                </ModalSectionWrapper>

                {/* Ubicación */}
                <ModalSectionWrapper title="UBICACIÓN">
                  <AddressAutocompleteManual
                    onAddressSelect={(address) => {
                      setAddressData((prev) => ({ ...prev, ...address }));
                      setValue("direccion_reserva", address.address, {
                        shouldValidate: true,
                      });
                      setValue("localidad_reserva", address.city);
                      setValue("provincia_reserva", address.province);
                    }}
                    onHouseNumberChange={(houseNumber) =>
                      setAddressData((prev) => ({ ...prev, houseNumber }))
                    }
                    initialAddress={addressData.address}
                    initialHouseNumber={addressData.houseNumber}
                  />
                  {errors.direccion_reserva && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.direccion_reserva.message}
                    </p>
                  )}
                </ModalSectionWrapper>

                {/* Valores y Comisiones */}
                <ModalSectionWrapper title="VALORES Y COMISIONES">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Valor de Reserva*"
                      type="number"
                      {...register("valor_reserva")}
                      placeholder="Valor de Reserva"
                      error={errors.valor_reserva?.message}
                      required
                    />
                    <Input
                      label="Porcentaje Honorarios Totales"
                      type="text"
                      value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
                      disabled
                    />
                    <Input
                      label={
                        isAlquiler
                          ? "Porcentaje Punta Inquilino*"
                          : "Porcentaje Punta Compradora*"
                      }
                      type="text"
                      {...register("porcentaje_punta_compradora", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      error={errors.porcentaje_punta_compradora?.message}
                      required
                    />
                    <Input
                      label={
                        isAlquiler
                          ? "Porcentaje Punta Propietario*"
                          : tipoOperacion === "Compra"
                            ? "Porcentaje Punta Vendedora"
                            : "Porcentaje Punta Vendedora*"
                      }
                      type="text"
                      {...register("porcentaje_punta_vendedora", {
                        setValueAs: (value) => {
                          if (
                            typeof value === "string" &&
                            value.trim() === ""
                          ) {
                            const tipoOp = getValues("tipo_operacion");
                            return !tipoOp || tipoOp === "Compra" ? 0 : null;
                          }
                          return parseFloat(value) || 0;
                        },
                      })}
                      error={errors.porcentaje_punta_vendedora?.message}
                      required={tipoOperacion !== "Compra"}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="font-semibold text-[#0077b6] block mb-3">
                      Puntas de la Operación*
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("punta_vendedora")}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">
                          {isAlquiler ? "Punta Propietario" : "Punta Vendedora"}
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("punta_compradora")}
                          className="w-4 h-4 text-[#0077b6] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">
                          {isAlquiler ? "Punta Inquilino" : "Punta Compradora"}
                        </span>
                      </label>
                    </div>
                    {(errors.punta_compradora?.message ||
                      errors.punta_vendedora?.message) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.punta_compradora?.message ||
                          errors.punta_vendedora?.message}
                      </p>
                    )}
                  </div>
                </ModalSectionWrapper>

                {/* Reservas y Refuerzos */}
                <ModalSectionWrapper title="RESERVAS Y REFUERZOS">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tipo de reserva"
                      type="text"
                      {...register("numero_sobre_reserva")}
                      placeholder="Tipo de reserva"
                      error={errors.numero_sobre_reserva?.message}
                    />
                    <Input
                      label="Monto de Reserva"
                      type="text"
                      {...register("monto_sobre_reserva")}
                      placeholder="Por ejemplo: 2000"
                      error={errors.monto_sobre_reserva?.message}
                    />
                    <Input
                      label="Tipo de refuerzo"
                      type="text"
                      {...register("numero_sobre_refuerzo")}
                      placeholder="Tipo de refuerzo"
                      error={errors.numero_sobre_refuerzo?.message}
                    />
                    <Input
                      label="Monto de refuerzo"
                      type="text"
                      {...register("monto_sobre_refuerzo")}
                      placeholder="Por ejemplo: 4000"
                      error={errors.monto_sobre_refuerzo?.message}
                    />
                    <Input
                      label="Asignar Gastos a la operación"
                      type="text"
                      {...register("gastos_operacion", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      placeholder="Por ejemplo: 500"
                      error={errors.gastos_operacion?.message}
                    />
                  </div>
                </ModalSectionWrapper>

                {/* Referencias y Compartidos */}
                <ModalSectionWrapper title="REFERENCIAS Y COMPARTIDOS">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Datos Referido"
                      type="text"
                      {...register("referido")}
                      placeholder="Datos Referido"
                      error={errors.referido?.message}
                    />
                    <Input
                      label="Porcentaje Referido"
                      type="text"
                      {...register("porcentaje_referido", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      placeholder="Por ejemplo 10%"
                      error={errors.porcentaje_referido?.message}
                    />
                    <Input
                      label="Datos Compartido"
                      type="text"
                      {...register("compartido")}
                      placeholder="Datos Compartido"
                      error={errors.compartido?.message}
                    />
                    <Input
                      label="Porcentaje Compartido"
                      type="text"
                      {...register("porcentaje_compartido", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      placeholder="Por ejemplo: 25%"
                      error={errors.porcentaje_compartido?.message}
                    />
                    <Input
                      label="Porcentaje destinado a franquicia o broker"
                      type="text"
                      {...register("isFranchiseOrBroker", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      placeholder="Por ejemplo: 10%"
                      error={errors.isFranchiseOrBroker?.message}
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="captacion_no_es_mia_modal"
                        {...register("captacion_no_es_mia" as keyof FormData)}
                        className="h-4 w-4 text-[#0077b6] rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        La captación es de la inmobiliaria (solo asesores)
                      </span>
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      Si marcas esta opción, solo se sumará el neto de la
                      operación a tus cálculos totales, no el bruto.
                    </p>
                  </div>
                </ModalSectionWrapper>

                {/* Gestión de Asesores */}
                <ModalSectionWrapper title="GESTIÓN DE ASESORES">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isTeamLeaderBroker && (
                      <Input
                        label="Porcentaje destinado a reparticion de honorarios"
                        type="text"
                        {...register("reparticion_honorarios_asesor", {
                          setValueAs: (v) => parseFloat(v) || 0,
                        })}
                        placeholder="Por ejemplo: 10%"
                        error={errors.reparticion_honorarios_asesor?.message}
                      />
                    )}
                    {isTeamLeaderBroker && (
                      <div className="md:col-span-2">
                        <Select
                          label="Asesor que realizó la venta"
                          register={register}
                          name="realizador_venta"
                          options={[
                            {
                              value: "",
                              label:
                                "Selecciona el asesor que realizó la operación",
                            },
                            ...sortedUsers.map((m) => ({
                              value: m.name,
                              label: m.name,
                            })),
                          ]}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          defaultValue={watch("realizador_venta") || ""}
                        />
                      </div>
                    )}
                    <Input
                      label="Porcentaje Honorarios Asesor"
                      type="text"
                      value={
                        isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker
                          ? "100%"
                          : undefined
                      }
                      disabled={
                        isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker
                      }
                      {...register("porcentaje_honorarios_asesor", {
                        setValueAs: (v) => parseFloat(v) || 0,
                      })}
                      error={errors.porcentaje_honorarios_asesor?.message}
                    />
                    {isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker && (
                      <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">ℹ️ Información:</span>{" "}
                          Cuando el Team Leader participa se lleva el 100% del
                          50% del bruto restante.
                        </p>
                      </div>
                    )}
                  </div>

                  {isTeamLeaderBroker && showAdditionalAdvisor && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300">
                      <div className="md:col-span-2">
                        <Select
                          label="Asesor adicional"
                          register={register}
                          name="realizador_venta_adicional"
                          options={[
                            {
                              value: "",
                              label:
                                "Selecciona el asesor participante en la operación",
                            },
                            ...sortedUsers.map((m) => ({
                              value: m.name,
                              label: m.name,
                            })),
                          ]}
                          className="w-full p-3 border border-gray-300 rounded-md"
                          defaultValue={
                            watch("realizador_venta_adicional") || ""
                          }
                        />
                      </div>
                      <Input
                        label="Porcentaje honorarios asesor adicional"
                        type="text"
                        placeholder="Por ejemplo: 40%"
                        value={
                          isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker
                            ? "100%"
                            : undefined
                        }
                        disabled={
                          isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker
                        }
                        {...register("porcentaje_honorarios_asesor_adicional", {
                          setValueAs: (v) => parseFloat(v) || 0,
                        })}
                        error={
                          errors.porcentaje_honorarios_asesor_adicional?.message
                        }
                      />
                    </div>
                  )}

                  {isTeamLeaderBroker && (
                    <div className="mt-4">
                      <button
                        type="button"
                        className="text-[#0077b6] font-semibold text-sm hover:text-[#023e8a] cursor-pointer transition-colors"
                        onClick={toggleAdditionalAdvisor}
                      >
                        {showAdditionalAdvisor
                          ? "➖ Eliminar Segundo Asesor"
                          : "➕ Agregar Otro Asesor"}
                      </button>
                    </div>
                  )}
                </ModalSectionWrapper>

                {/* Observaciones */}
                <ModalSectionWrapper title="OBSERVACIONES">
                  <TextArea
                    label="Observaciones"
                    {...register("observaciones")}
                    error={errors.observaciones?.message}
                    rows={4}
                    placeholder="Ingrese cualquier observación adicional sobre la operación..."
                  />
                </ModalSectionWrapper>

                {/* Botones de acción */}
                <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white px-8 py-3 rounded-lg hover:from-[#023e8a] hover:to-[#0077b6] transition-all duration-300 font-semibold shadow-lg disabled:opacity-50"
                  >
                    {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OperationsModal;
