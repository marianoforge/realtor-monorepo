import React from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import { UserRole } from "@gds-si/shared-utils";

import FormSectionWrapper from "./FormSectionWrapper";

interface UserMapped {
  name: string;
  uid: string;
}

interface AdvisorFeesSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  userRole: UserRole | undefined;
  usersMapped: UserMapped[];
  currentUserName: string;
  showAdditionalAdvisor: boolean;
  toggleAdditionalAdvisor: () => void;
  onAddUserClick?: () => void;
  sectionNumber?: number;
  className?: string;
}

const AdvisorFeesSection: React.FC<AdvisorFeesSectionProps> = ({
  register,
  errors,
  watch,
  userRole,
  usersMapped,
  currentUserName,
  showAdditionalAdvisor,
  toggleAdditionalAdvisor,
  onAddUserClick,
  sectionNumber = 6,
  className = "",
}) => {
  const isTeamLeaderPrimaryAdvisor =
    watch("realizador_venta") === currentUserName;
  const isTeamLeaderAdditionalAdvisor =
    watch("realizador_venta_adicional") === currentUserName;

  const isTeamLeaderBroker = userRole === UserRole.TEAM_LEADER_BROKER;

  const sortedUsers = [...usersMapped].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  return (
    <FormSectionWrapper
      icon={<UserGroupIcon className="w-5 h-5" />}
      title="Gestión de Honorarios"
      sectionNumber={sectionNumber}
      className={`fees-management-section ${className}`}
    >
      {isTeamLeaderBroker && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">📋 Importante:</span> Si sos Broker
            de una oficina o Team leader y comercializas propiedades, en el
            siguiente input debes poner el porcentaje que se lleva la franquicia
            o el broker respectivamente para poder calcular el neto de tu
            operación de manera correcta.
          </p>
        </div>
      )}

      <h3 className="text-md font-semibold text-gray-800 mb-4">
        Otros Honorarios
      </h3>

      <Input
        label="Porcentaje destinado a franquicia o broker"
        type="text"
        placeholder="Por ejemplo: 11%"
        {...register("isFranchiseOrBroker", {
          setValueAs: (value) => parseFloat(value) || 0,
        })}
        error={errors.isFranchiseOrBroker?.message as string}
        className="w-full"
      />

      {isTeamLeaderBroker && (
        <>
          <Input
            label="Repartición de honorarios inmobiliarios a un asesor o corredor inmobiliario según acuerdo previo."
            type="number"
            step="any"
            placeholder="Por ejemplo: 2.5%"
            {...register("reparticion_honorarios_asesor", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={errors.reparticion_honorarios_asesor?.message as string}
            className="w-full"
          />

          <hr className="my-6 border-gray-300" />
          <h3 className="text-md font-semibold text-gray-800 mb-4">
            Honorarios Asesores
          </h3>

          <Select
            label="Asesor que realizó la venta"
            register={register}
            name="realizador_venta"
            placeholder=""
            options={[
              { value: "", label: "Selecciona un asesor" },
              ...sortedUsers.map((member, index) => ({
                value: member.name,
                label: member.name,
                key: `primary-${member.uid}-${index}`,
              })),
            ]}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
          />
        </>
      )}

      <Input
        label="Porcentaje honorarios asesor"
        type="text"
        placeholder="Por ejemplo: 45%"
        value={
          isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker ? "100%" : undefined
        }
        disabled={isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker}
        {...register("porcentaje_honorarios_asesor", {
          setValueAs: (value) => parseFloat(value) || 0,
        })}
        error={errors.porcentaje_honorarios_asesor?.message as string}
        className="w-full"
      />

      {isTeamLeaderPrimaryAdvisor && isTeamLeaderBroker && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">ℹ️ Información:</span> Cuando el
            Team Leader participa se lleva el 100% del 50% del bruto restante.
          </p>
        </div>
      )}

      {showAdditionalAdvisor && (
        <>
          <Select
            label="Asesor adicional"
            register={register}
            name="realizador_venta_adicional"
            options={[
              {
                value: "",
                label: "Selecciona el asesor participante en la operación",
              },
              ...sortedUsers.map((member, index) => ({
                value: member.name,
                label: member.name,
                key: `additional-${member.uid}-${index}`,
              })),
            ]}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
          />

          <Input
            label="Porcentaje honorarios asesor adicional"
            type="text"
            placeholder="Por ejemplo: 40%"
            value={
              isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker
                ? "100%"
                : undefined
            }
            disabled={isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker}
            {...register("porcentaje_honorarios_asesor_adicional", {
              setValueAs: (value) => parseFloat(value) || 0,
            })}
            error={
              errors.porcentaje_honorarios_asesor_adicional?.message as string
            }
            className="w-full"
          />

          {isTeamLeaderAdditionalAdvisor && isTeamLeaderBroker && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">ℹ️ Información:</span> Cuando el
                Team Leader participa se lleva el 100% del 50% del bruto
                restante.
              </p>
            </div>
          )}
        </>
      )}

      {isTeamLeaderBroker && (
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="text-[#0077b6] hover:text-[#005a8a] font-semibold text-sm transition-colors"
            onClick={toggleAdditionalAdvisor}
          >
            {showAdditionalAdvisor
              ? "Eliminar asesor adicional"
              : "Agregar asesor adicional a la operación"}
          </button>
          {onAddUserClick && (
            <button
              type="button"
              className="text-[#0077b6] hover:text-[#005a8a] font-semibold text-sm transition-colors"
              onClick={onAddUserClick}
            >
              Crear Asesor
            </button>
          )}
        </div>
      )}
    </FormSectionWrapper>
  );
};

export default AdvisorFeesSection;
