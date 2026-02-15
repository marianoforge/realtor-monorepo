/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType } from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BuildingOffice2Icon,
  SparklesIcon,
  DocumentTextIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";

import Button from "@/components/PrivateComponente/FormComponents/Button";
import { auth } from "@/lib/firebase";
import { createOperation } from "@/lib/api/operationsApi";
import { calculateHonorarios } from "@gds-si/shared-utils";
import { schema } from "@gds-si/shared-schemas/operationsFormSchema";
import { Operation, TeamMember } from "@gds-si/shared-types";
import { useUserDataStore } from "@/stores/userDataStore";
import { useTeamMembers } from "@/common/hooks/useTeamMembers";
import { formatDateForUser, safeDateToYYYYMMDD } from "@gds-si/shared-utils";
import ModalOK from "@/components/PrivateComponente/CommonComponents/Modal";
import Toast, {
  useToast,
} from "@/components/PrivateComponente/CommonComponents/Toast";
import { PATHS, QueryKeys, UserRole } from "@gds-si/shared-utils";
import AddUserModal from "@/modules/agents/AddUserModal";
import OperationsTour from "@/components/PrivateComponente/Tour/OperationsTour";
import { TokkoProperty } from "@/common/hooks/useTokkoProperties";

import TokkoPropertySearchModal from "./TokkoPropertySearchModal";
import TokkoPropertyPreviewModal from "./TokkoPropertyPreviewModal";
import TokkoApiKeyWarningModal from "./TokkoApiKeyWarningModal";
import {
  GeneralInfoSection,
  LocationSection,
  ValuesCommissionsSection,
  ReservationsSection,
  ReferencesSection,
  AdvisorFeesSection,
  ObservationsSection,
  AddressData,
} from "./components";

type FormData = InferType<typeof schema>;

const VIDEO_URLS: Record<string, string> = {
  [UserRole.TEAM_LEADER_BROKER]:
    "https://www.loom.com/share/5a29a6056a204be88b602d77b53f0e9d",
  [UserRole.AGENTE_ASESOR]:
    "https://www.loom.com/share/c7cf44c6ba15486a8e271e75daaa88ef",
};

const OperationsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    getValues,
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    reValidateMode: "onChange",
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
      realizador_venta: null,
      realizador_venta_adicional: null,
      porcentaje_honorarios_asesor: null,
      porcentaje_honorarios_asesor_adicional: null,
      gastos_operacion: null,
    } as FormData,
  });

  const { data: teamMembers } = useTeamMembers();
  const [userUID, setUserUID] = useState<string | null>(null);
  const { userData } = useUserDataStore();
  const [userTimeZone, setUserTimeZone] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage] = useState("");
  const [honorariosBroker, setHonorariosBroker] = useState(0);
  const [honorariosAsesor, setHonorariosAsesor] = useState(0);
  const [porcentajeHonorariosBroker, setPorcentajeHonorariosBroker] =
    useState(0);
  const [showAdditionalAdvisor, setShowAdditionalAdvisor] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    address: "",
    city: null,
    province: null,
    country: null,
    houseNumber: "",
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isTokkoModalOpen, setIsTokkoModalOpen] = useState(false);
  const [isTokkoPreviewModalOpen, setIsTokkoPreviewModalOpen] = useState(false);
  const [isTokkoApiKeyWarningOpen, setIsTokkoApiKeyWarningOpen] =
    useState(false);
  const [selectedTokkoProperty, setSelectedTokkoProperty] =
    useState<TokkoProperty | null>(null);
  const [addressAutocompleteKey, setAddressAutocompleteKey] = useState(0);

  const { toastVisible, toastType, toastMessage, showToast, hideToast } =
    useToast();

  const router = useRouter();
  const queryClient = useQueryClient();
  const userRole = userData?.role;

  const usersMapped = [
    ...(teamMembers?.map((member) => ({
      name: `${member.firstName} ${member.lastName}`,
      uid: member.id,
    })) || []),
    ...(userUID
      ? [
          {
            name:
              `${userData?.firstName} ${userData?.lastName}` || "Logged User",
            uid: userUID,
          },
        ]
      : []),
  ];

  const currentUserName =
    `${userData?.firstName} ${userData?.lastName}` || "Logged User";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUID(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserTimeZone(timeZone);
  }, []);

  const watchAllFields = watch();
  const date = watch("fecha_operacion");
  const formattedDate = date ? formatDateForUser(date, userTimeZone) : "";

  useEffect(() => {
    const valor_reserva = parseFloat(String(watchAllFields.valor_reserva)) || 0;
    const porcentaje_honorarios_asesor =
      parseFloat(String(watchAllFields.porcentaje_honorarios_asesor)) || 0;
    const porcentaje_punta_compradora =
      parseFloat(String(watchAllFields.porcentaje_punta_compradora)) || 0;
    const porcentaje_punta_vendedora =
      parseFloat(String(watchAllFields.porcentaje_punta_vendedora)) || 0;
    const porcentaje_compartido =
      parseFloat(String(watchAllFields.porcentaje_compartido)) || 0;
    const porcentaje_referido =
      parseFloat(String(watchAllFields.porcentaje_referido)) || 0;

    const currentPorcentajeHonorariosBroker =
      porcentaje_punta_compradora + porcentaje_punta_vendedora;

    const { honorariosBroker, honorariosAsesor } = calculateHonorarios(
      valor_reserva,
      porcentaje_honorarios_asesor,
      currentPorcentajeHonorariosBroker,
      porcentaje_compartido,
      porcentaje_referido
    );

    setHonorariosBroker(honorariosBroker);
    setHonorariosAsesor(honorariosAsesor);
    setPorcentajeHonorariosBroker(currentPorcentajeHonorariosBroker);
  }, [
    watchAllFields.valor_reserva,
    watchAllFields.porcentaje_honorarios_asesor,
    watchAllFields.porcentaje_punta_compradora,
    watchAllFields.porcentaje_punta_vendedora,
    watchAllFields.porcentaje_compartido,
    watchAllFields.porcentaje_referido,
  ]);

  const mutation = useMutation({
    mutationFn: createOperation,
    onSuccess: () => {
      if (userUID) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.OPERATIONS, userUID],
        });
      }
      showToast("success", "Operación guardada exitosamente");
      reset();
      setAddressData({
        address: "",
        city: null,
        province: null,
        country: null,
        houseNumber: "",
      });
      setAddressAutocompleteKey((prev) => prev + 1);
      setTimeout(() => {
        router.push(PATHS.DASHBOARD);
      }, 2000);
    },
    onError: (error: Error & { response?: { status?: number } }) => {
      console.error("Error creating operation:", error);
      let errorMessage = "Error al guardar la operación";
      if (error.response?.status === 400) {
        errorMessage = "Datos inválidos. Verifica la información ingresada";
      } else if (error.response?.status === 500) {
        errorMessage = "Error del servidor. Inténtalo más tarde";
      } else if (error.message) {
        errorMessage = error.message;
      }
      showToast("error", errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (!data.fecha_reserva) {
      showToast("error", "La fecha de reserva es obligatoria");
      return;
    }

    if (!data.valor_reserva || data.valor_reserva <= 0) {
      showToast(
        "error",
        "El valor de reserva es obligatorio y debe ser mayor a 0"
      );
      return;
    }

    if (!data.tipo_operacion) {
      showToast("error", "Debe seleccionar el tipo de operación");
      return;
    }

    if (!addressData.address.trim()) {
      showToast("error", "La dirección es obligatoria");
      return;
    }

    if (!userUID) {
      showToast("error", "Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    const selectedUser = usersMapped.find(
      (member: { name: string }) => member.name === data.realizador_venta
    );
    const assignedUserUID =
      selectedUser && selectedUser.uid !== userUID ? selectedUser.uid : userUID;

    const selectedUserAdicional = usersMapped.find(
      (member: { name: string }) =>
        member.name === data.realizador_venta_adicional
    );
    const assignedUserUIDAdicional =
      selectedUserAdicional && selectedUserAdicional.uid !== userUID
        ? selectedUserAdicional.uid
        : "";

    let porcentajeHonorariosAsesor = data.porcentaje_honorarios_asesor || 0;
    const isTeamLeaderPrimaryAdvisor =
      watch("realizador_venta") === currentUserName;
    if (
      isTeamLeaderPrimaryAdvisor &&
      userRole === UserRole.TEAM_LEADER_BROKER
    ) {
      porcentajeHonorariosAsesor = 100;
    }

    let porcentajeHonorariosAsesorAdicional =
      data.porcentaje_honorarios_asesor_adicional || 0;
    const isTeamLeaderAdditionalAdvisor =
      watch("realizador_venta_adicional") === currentUserName;
    if (
      isTeamLeaderAdditionalAdvisor &&
      userRole === UserRole.TEAM_LEADER_BROKER
    ) {
      porcentajeHonorariosAsesorAdicional = 100;
    }

    const dataToSubmit = {
      ...data,
      direccion_reserva: addressData.address,
      numero_casa: addressData.houseNumber,
      localidad_reserva: addressData.city,
      provincia_reserva: addressData.province,
      pais: addressData.country,
      fecha_captacion: safeDateToYYYYMMDD(data.fecha_captacion),
      fecha_reserva: safeDateToYYYYMMDD(data.fecha_reserva),
      fecha_operacion: safeDateToYYYYMMDD(data.fecha_operacion),
      fecha_vencimiento_alquiler: safeDateToYYYYMMDD(
        data.fecha_vencimiento_alquiler
      ),
      honorarios_broker: honorariosBroker,
      honorarios_asesor: honorariosAsesor,
      user_uid: assignedUserUID,
      user_uid_adicional: assignedUserUIDAdicional,
      teamId: userUID,
      punta_compradora: data.punta_compradora ? 1 : 0,
      punta_vendedora: data.punta_vendedora ? 1 : 0,
      exclusiva: data.exclusiva ? true : !data.no_exclusiva ? "N/A" : false,
      no_exclusiva: data.no_exclusiva ? true : !data.exclusiva ? "N/A" : false,
      estado: "En Curso",
      porcentaje_punta_compradora: data.porcentaje_punta_compradora || 0,
      porcentaje_punta_vendedora: data.porcentaje_punta_vendedora || 0,
      porcentaje_honorarios_broker: porcentajeHonorariosBroker,
      porcentaje_honorarios_asesor: porcentajeHonorariosAsesor,
      porcentaje_honorarios_asesor_adicional:
        porcentajeHonorariosAsesorAdicional,
      reparticion_honorarios_asesor: data.reparticion_honorarios_asesor || 0,
      tipo_inmueble: data.tipo_inmueble,
      gastos_operacion: data.gastos_operacion || 0,
      captacion_no_es_mia:
        (data as Record<string, unknown>).captacion_no_es_mia || false,
    };

    mutation.mutate(dataToSubmit as unknown as Operation);
  };

  const handleModalAccept = () => {
    router.push(PATHS.DASHBOARD);
  };

  const toggleAdditionalAdvisor = () => {
    setShowAdditionalAdvisor((prev) => !prev);
  };

  const handleTokkoPropertySelected = (property: TokkoProperty) => {
    setSelectedTokkoProperty(property);
    setIsTokkoModalOpen(false);
    handleTokkoPropertyMapToForm(property);
    setSelectedTokkoProperty(null);
  };

  const handleConfirmTokkoProperty = () => {
    if (selectedTokkoProperty) {
      handleTokkoPropertyMapToForm(selectedTokkoProperty);
      setIsTokkoPreviewModalOpen(false);
      setSelectedTokkoProperty(null);
    }
  };

  const handleTokkoPropertyMapToForm = (property: TokkoProperty) => {
    const address = property.real_address || "";
    const newAddressData = {
      address: address,
      city: property.location?.name || null,
      province: null,
      country: "Argentina",
      houseNumber: "",
    };

    setAddressData(newAddressData);
    setAddressAutocompleteKey((prev) => prev + 1);
    setValue("direccion_reserva", address, { shouldValidate: true });
    setValue("localidad_reserva", property.location?.name || null);

    const operationType = property.operations?.[0]?.operation_type;
    if (operationType === "Sale") {
      setValue("tipo_operacion", "Venta", { shouldValidate: true });
    } else if (operationType === "Rental") {
      setValue("tipo_operacion", "Alquiler Tradicional", {
        shouldValidate: true,
      });
    }

    const price = property.operations?.[0]?.prices?.[0]?.price;
    if (price) {
      setValue("valor_reserva", price, { shouldValidate: true });
    }

    const commission = property.internal_data?.commission;
    if (commission && commission.trim() !== "" && parseFloat(commission) > 0) {
      setValue("porcentaje_punta_vendedora", parseFloat(commission), {
        shouldValidate: true,
      });
    }

    setValue("punta_vendedora", true, { shouldValidate: true });

    if (property.producer?.name) {
      const advisorExists = usersMapped.some(
        (member) => member.name.trim() === property.producer.name.trim()
      );
      if (advisorExists) {
        setValue("realizador_venta", property.producer.name);
      } else {
        showToast(
          "error",
          `El asesor "${property.producer.name}" no está registrado en el sistema. Por favor, selecciónalo manualmente o créalo primero.`
        );
      }
    }

    const propertyType = property.type?.name;
    const propertyTypeCode = property.type?.code;
    const typeMappingByCode: Record<string, string> = {
      AP: "Departamentos",
      CA: "Casa",
      PH: "PH",
      TE: "Terreno",
      OF: "Oficina",
      LC: "Local Comercial",
      DE: "Depósito",
      GA: "Cochera",
      BO: "Bodega",
      LO: "Loft",
      QU: "Quinta",
      CH: "Chacra",
      ED: "Edificio",
    };
    const typeMappingByName: Record<string, string> = {
      Apartment: "Departamentos",
      House: "Casa",
      PH: "PH",
      Land: "Terreno",
      Office: "Oficina",
      Store: "Local Comercial",
      Warehouse: "Depósito",
      Garage: "Cochera",
    };

    const mappedType =
      typeMappingByCode[propertyTypeCode || ""] ||
      typeMappingByName[propertyType || ""] ||
      propertyType ||
      "";

    if (mappedType) {
      setValue("tipo_inmueble", mappedType, { shouldValidate: true });
    }

    let observations = "";
    if (property.publication_title) {
      observations += `📋 ${property.publication_title}\n\n`;
    }

    const description = property.rich_description || property.description;
    if (description && description.trim() !== "") {
      observations += `Descripción:\n${description}\n\n`;
    }

    observations += `Características:\n`;
    if (property.room_amount > 0)
      observations += `• Ambientes: ${property.room_amount}\n`;
    if (property.bathroom_amount > 0)
      observations += `• Baños: ${property.bathroom_amount}\n`;
    if (property.surface)
      observations += `• Superficie: ${property.surface} m²\n`;
    if (property.total_surface && property.total_surface !== property.surface) {
      observations += `• Superficie Total: ${property.total_surface} m²\n`;
    }
    if (property.parking_lot_amount > 0)
      observations += `• Cocheras: ${property.parking_lot_amount}\n`;
    if (property.expenses > 0)
      observations += `• Expensas: $${property.expenses}\n`;

    observations += `\n📎 Información de Tokko:\n`;
    observations += `• Código de Referencia: ${property.reference_code}\n`;
    if (property.public_url)
      observations += `• URL Pública: ${property.public_url}\n`;
    observations += `• Asesor Responsable: ${property.producer?.name || "N/A"}\n`;
    observations += `• Email: ${property.producer?.email || "N/A"}\n`;
    if (property.producer?.cellphone)
      observations += `• Teléfono: ${property.producer.cellphone}\n`;
    if (property.internal_data?.commission) {
      observations += `• Comisión en Tokko: ${property.internal_data.commission}%\n`;
    }

    setValue("observaciones", observations);
    showToast(
      "success",
      "Datos de la propiedad cargados exitosamente desde Tokko"
    );
  };

  const handleTokkoImportClick = () => {
    const tokkoApiKey = userData?.tokkoApiKey;
    if (!tokkoApiKey || tokkoApiKey.trim() === "") {
      setIsTokkoApiKeyWarningOpen(true);
    } else {
      setIsTokkoModalOpen(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#0077b6] to-[#023e8a] px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BuildingOffice2Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">
                    Agregar Reserva / Operación
                  </h1>
                  <p className="text-blue-100">
                    Registra una nueva operación inmobiliaria en el sistema
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/escenarios-calculo"
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Escenarios de Cálculo
                  </Link>
                  <button
                    type="button"
                    onClick={handleTokkoImportClick}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Importar desde Tokko
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunTour(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    🎯 Iniciar Tour Guiado
                  </button>
                  {userRole && VIDEO_URLS[userRole] && (
                    <a
                      href={VIDEO_URLS[userRole]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                      Ver Tutorial
                    </a>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6" noValidate>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GeneralInfoSection
                  register={register}
                  errors={errors}
                  watch={watch}
                  trigger={trigger}
                  setValue={setValue}
                  formattedDate={formattedDate}
                  sectionNumber={1}
                />

                <LocationSection
                  addressData={addressData}
                  setAddressData={setAddressData}
                  setValue={setValue}
                  addressAutocompleteKey={addressAutocompleteKey}
                  sectionNumber={2}
                  errors={errors}
                />

                <ValuesCommissionsSection
                  register={register}
                  errors={errors}
                  watch={watch}
                  getValues={getValues}
                  trigger={trigger}
                  porcentajeHonorariosBroker={porcentajeHonorariosBroker}
                  sectionNumber={3}
                />

                <ReservationsSection
                  register={register}
                  errors={errors}
                  sectionNumber={4}
                />

                <ReferencesSection
                  register={register}
                  errors={errors}
                  sectionNumber={5}
                />

                <AdvisorFeesSection
                  register={register}
                  errors={errors}
                  watch={watch}
                  userRole={userRole as UserRole | undefined}
                  usersMapped={usersMapped}
                  currentUserName={currentUserName}
                  showAdditionalAdvisor={showAdditionalAdvisor}
                  toggleAdditionalAdvisor={toggleAdditionalAdvisor}
                  onAddUserClick={() => setIsAddUserModalOpen(true)}
                  sectionNumber={6}
                />
              </div>

              <ObservationsSection
                register={register}
                errors={errors}
                sectionNumber={7}
                className="mt-6"
              />

              <div className="form-actions flex gap-4 justify-end pt-6 mt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.push(PATHS.DASHBOARD)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0077b6] to-[#023e8a] text-white rounded-lg hover:from-[#005a8a] hover:to-[#001d3b] transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? "Guardando..." : "Guardar Operación"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ModalOK
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
        onAccept={handleModalAccept}
      />

      {isAddUserModalOpen && (
        <AddUserModal onClose={() => setIsAddUserModalOpen(false)} />
      )}

      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={toastVisible}
        onClose={hideToast}
      />

      <OperationsTour run={runTour} onTourComplete={() => setRunTour(false)} />

      <TokkoPropertySearchModal
        isOpen={isTokkoModalOpen}
        onClose={() => setIsTokkoModalOpen(false)}
        onSelectProperty={handleTokkoPropertySelected}
        tokkoApiKey={userData?.tokkoApiKey}
      />

      <TokkoApiKeyWarningModal
        isOpen={isTokkoApiKeyWarningOpen}
        onClose={() => setIsTokkoApiKeyWarningOpen(false)}
      />

      <TokkoPropertyPreviewModal
        isOpen={isTokkoPreviewModalOpen}
        onClose={() => {
          setIsTokkoPreviewModalOpen(false);
          setSelectedTokkoProperty(null);
        }}
        onConfirm={handleConfirmTokkoProperty}
        property={selectedTokkoProperty}
        availableAdvisors={usersMapped.map((m) => m.name)}
      />
    </>
  );
};

export default OperationsForm;
