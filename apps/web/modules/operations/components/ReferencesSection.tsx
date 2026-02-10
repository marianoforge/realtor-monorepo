import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { UserGroupIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";

import FormSectionWrapper from "./FormSectionWrapper";

interface ReferencesSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  sectionNumber?: number;
  className?: string;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  register,
  errors,
  sectionNumber = 5,
  className = "",
}) => {
  return (
    <FormSectionWrapper
      icon={<UserGroupIcon className="w-5 h-5" />}
      title="Referencias y Compartidos"
      sectionNumber={sectionNumber}
      className={`references-section ${className}`}
    >
      <Input
        label="Datos Referido"
        type="text"
        placeholder="Por ejemplo: Juan Pérez"
        {...register("referido")}
        error={errors.referido?.message as string}
        className="w-full"
      />

      <Input
        label="Porcentaje Referido"
        type="text"
        placeholder="Por ejemplo: 25%"
        {...register("porcentaje_referido", {
          setValueAs: (value) => parseFloat(value) || 0,
        })}
        error={errors.porcentaje_referido?.message as string}
        className="w-full"
      />

      <Input
        label="Datos Compartido"
        type="text"
        placeholder="Por ejemplo: Juana Pérez"
        {...register("compartido")}
        error={errors.compartido?.message as string}
        className="w-full"
      />

      <Input
        label="Porcentaje Compartido"
        type="text"
        placeholder="Por ejemplo: 2%"
        {...register("porcentaje_compartido", {
          setValueAs: (value) => parseFloat(value) || 0,
        })}
        error={errors.porcentaje_compartido?.message as string}
        className="w-full"
      />

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="captacion_no_es_mia"
            {...register("captacion_no_es_mia")}
            className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
          />
          <label
            htmlFor="captacion_no_es_mia"
            className="text-sm font-medium text-gray-700"
          >
            La captación es de la inmobiliaria (solo asesores)
          </label>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Si marcas esta opción, solo se sumará el neto de la operación a tus
          cálculos totales, no el bruto.
        </p>
      </div>
    </FormSectionWrapper>
  );
};

export default ReferencesSection;
