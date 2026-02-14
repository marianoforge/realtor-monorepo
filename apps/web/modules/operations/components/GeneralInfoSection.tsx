import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormTrigger,
  UseFormSetValue,
} from "react-hook-form";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import { operationTypes, propertyTypes } from "@/lib/data";

import FormSectionWrapper from "./FormSectionWrapper";

interface GeneralInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  trigger?: UseFormTrigger<any>;
  setValue?: UseFormSetValue<any>;
  formattedDate?: string;
  sectionNumber?: number;
  className?: string;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  register,
  errors,
  watch,
  trigger,
  setValue,
  formattedDate = "",
  sectionNumber = 1,
  className = "",
}) => {
  const tipoOperacion = watch("tipo_operacion");
  const showPropertyType =
    tipoOperacion === "Venta" || tipoOperacion === "Compra";
  const isAlquiler =
    tipoOperacion === "Alquiler Tradicional" ||
    tipoOperacion === "Alquiler Temporal" ||
    tipoOperacion === "Alquiler Comercial";

  return (
    <FormSectionWrapper
      icon={<DocumentTextIcon className="w-5 h-5" />}
      title="Información General"
      sectionNumber={sectionNumber}
      className={`information-general-section ${className}`}
    >
      <Input
        label="Fecha de Captación / Publicación"
        type="date"
        defaultValue={formattedDate}
        {...register("fecha_captacion")}
        error={errors.fecha_captacion?.message as string}
        className="w-full"
      />

      <Input
        label="Fecha de Reserva / Promesa*"
        type="date"
        defaultValue={formattedDate}
        {...register("fecha_reserva")}
        error={errors.fecha_reserva?.message as string}
        required
        className="w-full"
      />

      <Input
        label="Fecha de Cierre"
        type="date"
        defaultValue={formattedDate}
        {...register("fecha_operacion")}
        error={errors.fecha_operacion?.message as string}
        className="w-full"
      />

      <Select
        label="Tipo de operación*"
        register={register}
        name="tipo_operacion"
        options={operationTypes}
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
        required
      />
      {errors.tipo_operacion && (
        <p className="text-red-500 text-sm mt-1">
          {errors.tipo_operacion.message as string}
        </p>
      )}

      {showPropertyType && (
        <>
          <Select
            label="Tipo de Inmueble*"
            register={register}
            name="tipo_inmueble"
            options={propertyTypes}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]"
            required
          />
          {errors.tipo_inmueble && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tipo_inmueble.message as string}
            </p>
          )}
        </>
      )}

      {isAlquiler && (
        <Input
          label="Fecha de Vencimiento del Alquiler"
          type="date"
          {...register("fecha_vencimiento_alquiler")}
          error={errors.fecha_vencimiento_alquiler?.message as string}
          className="w-full"
        />
      )}

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Exclusividad de la Operación
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="exclusividad"
              checked={watch("exclusiva") === true}
              onChange={() => {
                setValue?.("exclusiva", true, { shouldValidate: true });
                setValue?.("no_exclusiva", false, { shouldValidate: true });
                trigger?.(["exclusiva", "no_exclusiva"]);
              }}
              className="h-4 w-4 text-[#0077b6] border-gray-300 focus:ring-[#0077b6]"
            />
            <span className="text-sm text-gray-700">Exclusiva</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="exclusividad"
              checked={watch("no_exclusiva") === true}
              onChange={() => {
                setValue?.("exclusiva", false, { shouldValidate: true });
                setValue?.("no_exclusiva", true, { shouldValidate: true });
                trigger?.(["exclusiva", "no_exclusiva"]);
              }}
              className="h-4 w-4 text-[#0077b6] border-gray-300 focus:ring-[#0077b6]"
            />
            <span className="text-sm text-gray-700">No Exclusiva</span>
          </label>
        </div>
      </div>
    </FormSectionWrapper>
  );
};

export default GeneralInfoSection;
