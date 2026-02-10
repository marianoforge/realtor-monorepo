import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormGetValues,
  UseFormTrigger,
} from "react-hook-form";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";

import FormSectionWrapper from "./FormSectionWrapper";

interface ValuesCommissionsSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  getValues: UseFormGetValues<any>;
  trigger?: UseFormTrigger<any>;
  porcentajeHonorariosBroker: number;
  sectionNumber?: number;
  className?: string;
}

const ValuesCommissionsSection: React.FC<ValuesCommissionsSectionProps> = ({
  register,
  errors,
  watch,
  getValues,
  trigger,
  porcentajeHonorariosBroker,
  sectionNumber = 3,
  className = "",
}) => {
  const tipoOperacion = watch("tipo_operacion");
  const isAlquiler =
    tipoOperacion === "Alquiler Tradicional" ||
    tipoOperacion === "Alquiler Temporal" ||
    tipoOperacion === "Alquiler Comercial";

  const getLabelPuntaVendedora = () => {
    const labelText = isAlquiler
      ? "Porcentaje punta propietario"
      : "Porcentaje punta vendedora";
    return tipoOperacion === "Compra" ? labelText : `${labelText}*`;
  };

  const getLabelPuntaCompradora = () => {
    return isAlquiler
      ? "Porcentaje punta inquilino*"
      : "Porcentaje punta compradora*";
  };

  const getPuntaVendedoraLabel = () => {
    return isAlquiler ? "Punta Propietario" : "Punta Vendedora";
  };

  const getPuntaCompradoraLabel = () => {
    return isAlquiler ? "Punta Inquilino" : "Punta Compradora";
  };

  return (
    <FormSectionWrapper
      icon={<CurrencyDollarIcon className="w-5 h-5" />}
      title="Valores y Comisiones"
      sectionNumber={sectionNumber}
      className={`values-commissions-section ${className}`}
    >
      <Input
        label="Valor de oferta / operación*"
        type="number"
        step="any"
        placeholder="Por ejemplo: 200000"
        {...register("valor_reserva")}
        error={errors.valor_reserva?.message as string}
        required
        className="w-full"
      />

      <Input
        label={getLabelPuntaVendedora()}
        type="text"
        placeholder="Por ejemplo: 3%"
        {...register("porcentaje_punta_vendedora", {
          setValueAs: (value) => {
            const tipoOp = getValues("tipo_operacion");
            if (typeof value === "string" && value.trim() === "") {
              if (!tipoOp || tipoOp === "Compra") {
                return 0;
              }
              return undefined; // Retorna undefined para que required() lo detecte
            }
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
          },
        })}
        error={errors.porcentaje_punta_vendedora?.message as string}
        required={tipoOperacion !== "Compra"}
        className="w-full"
      />

      <Input
        label={getLabelPuntaCompradora()}
        type="text"
        placeholder="Por ejemplo: 4%"
        {...register("porcentaje_punta_compradora", {
          setValueAs: (value) => {
            if (typeof value === "string" && value.trim() === "") {
              return undefined; // Retorna undefined para que required() lo detecte
            }
            const parsed = parseFloat(value);
            return isNaN(parsed) ? undefined : parsed;
          },
        })}
        error={errors.porcentaje_punta_compradora?.message as string}
        required
        className="w-full"
      />

      <Input
        label="Porcentaje honorarios totales"
        type="text"
        value={`${porcentajeHonorariosBroker.toFixed(2)}%`}
        disabled
        className="w-full bg-gray-100 cursor-not-allowed"
      />

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cantidad de puntas*
        </label>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("punta_vendedora", {
                onChange: () =>
                  trigger?.(["punta_vendedora", "punta_compradora"]),
              })}
              className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
            />
            <label className="text-sm text-gray-700">
              {getPuntaVendedoraLabel()}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("punta_compradora", {
                onChange: () =>
                  trigger?.(["punta_vendedora", "punta_compradora"]),
              })}
              className="h-4 w-4 text-[#0077b6] rounded border-gray-300 focus:ring-[#0077b6]"
            />
            <label className="text-sm text-gray-700">
              {getPuntaCompradoraLabel()}
            </label>
          </div>
        </div>
        {(errors.punta_vendedora || errors.punta_compradora) && (
          <p className="text-red-500 text-sm mt-1">
            {
              (errors.punta_vendedora?.message ||
                errors.punta_compradora?.message) as string
            }
          </p>
        )}
      </div>

      <Input
        label="Asignar Gastos a la operación"
        type="number"
        step="any"
        placeholder="Por ejemplo: 500.75"
        {...register("gastos_operacion", {
          setValueAs: (value) => parseFloat(value) || 0,
        })}
        error={errors.gastos_operacion?.message as string}
        className="w-full"
      />
    </FormSectionWrapper>
  );
};

export default ValuesCommissionsSection;
