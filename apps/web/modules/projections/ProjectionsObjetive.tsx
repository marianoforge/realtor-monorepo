import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Input from "@/components/PrivateComponente/FormComponents/Input";

const formatNumberWithThousands = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const schema = yup.object().shape({
  objetivoHonorariosAnuales: yup
    .number()
    .required("Objetivo Honorarios Anuales es requerido")
    .positive("Debe ser un número positivo"),
});

interface ProjectionsObjetiveProps {
  ticketPromedio: number;
  promedioHonorariosNetos: number;
  efectividad: number;
  semanasDelAno: number;
  onObjetivoChange?: (value: number) => void;
  initialObjetivoValue?: number;
}

const ProjectionsObjective = ({
  ticketPromedio,
  promedioHonorariosNetos,
  efectividad,
  semanasDelAno,
  onObjetivoChange,
  initialObjetivoValue = 0,
}: ProjectionsObjetiveProps) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      objetivoHonorariosAnuales: initialObjetivoValue,
    },
  });

  useEffect(() => {
    if (initialObjetivoValue > 0) {
      setValue("objetivoHonorariosAnuales", initialObjetivoValue);
    }
  }, [initialObjetivoValue, setValue]);

  const objetivoHonorariosAnuales = watch("objetivoHonorariosAnuales");

  const esValido =
    objetivoHonorariosAnuales > 0 &&
    promedioHonorariosNetos > 0 &&
    efectividad > 0 &&
    ticketPromedio > 0;

  const volumenAFacturar = esValido
    ? objetivoHonorariosAnuales / (promedioHonorariosNetos / 100)
    : 0;

  const totalPuntasCierres = esValido
    ? Number(volumenAFacturar) / ticketPromedio
    : 0;

  const totalPuntasCierresAnuales = esValido
    ? (Number(totalPuntasCierres) / efectividad) * 100
    : 0;

  const totalPuntasCierresSemanales = esValido
    ? Number(totalPuntasCierresAnuales) / semanasDelAno
    : 0;

  React.useEffect(() => {
    if (onObjetivoChange) {
      onObjetivoChange(objetivoHonorariosAnuales);
    }
  }, [objetivoHonorariosAnuales, onObjetivoChange]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 mb-4 w-full">
        <h3 className="font-bold text-green-600 mb-2">
          Información sobre movimientos a efectuar
        </h3>
        <p className="text-xs text-gray-600">
          Resultados calculados basados en tus parámetros de proyección
        </p>
      </div>
      <div className="flex flex-col w-full">
        <div className="w-full">
          <Controller
            name="objetivoHonorariosAnuales"
            control={control}
            render={({ field }) => (
              <Input
                label="Objetivo Hon. Anuales Brutos"
                type="number"
                className="w-full"
                {...field}
                error={errors.objetivoHonorariosAnuales?.message}
                labelSize="text-sm"
                showTooltip={true}
                tooltipContent="Ingresa tu objetivo de honorarios anuales."
              />
            )}
          />
        </div>
        <div className="w-full">
          <Input
            label="Volumen a Facturar"
            type="text"
            className="w-full"
            value={formatNumberWithThousands(volumenAFacturar)}
            disabled
            labelSize="text-sm"
            showTooltip={true}
            tooltipContent="Cálculo del volumen a facturar en base a tu objetivo de honorarios anuales."
          />
        </div>
        <div className="w-full">
          <Input
            label="Total de Puntas o Cierres"
            type="text"
            className="w-full"
            value={formatNumberWithThousands(totalPuntasCierres)}
            labelSize="text-sm"
            disabled
            showTooltip={true}
            tooltipContent="Cálculo del total de puntas o cierres en base al volumen a facturar."
          />
        </div>
        <div className="w-full">
          <Input
            label="Total de PL / PB"
            type="text"
            className="w-full"
            value={formatNumberWithThousands(totalPuntasCierresAnuales)}
            labelSize="text-sm"
            disabled
            showTooltip={true}
            tooltipContent="Cálculo del total de pre listings / pre buying a realizar anualmente."
          />
        </div>
        <div className="w-full">
          <Input
            label="Total de PL / PB Semanales"
            type="text"
            className="w-full"
            value={formatNumberWithThousands(totalPuntasCierresSemanales)}
            labelSize="text-sm"
            disabled
            marginBottom="mb-2"
            showTooltip={true}
            tooltipContent="Cálculo del total de PL / PB a realizar semanalmente"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectionsObjective;
