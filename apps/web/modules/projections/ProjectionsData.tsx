import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import { fetchUserOperations } from "@/lib/api/operationsApi";
import SkeletonLoader from "@/components/PrivateComponente/CommonComponents/SkeletonLoader";
import { useProjectionData } from "@/common/hooks/useProjectionData";

import ProjectionsObjetive from "./ProjectionsObjetive";

const ProjectionsData = ({ userId }: { userId: string }) => {
  const { isLoading: isLoadingOperations, error: operationsError } = useQuery({
    queryKey: ["operations", userId],
    queryFn: () => fetchUserOperations(userId),
    enabled: !!userId,
  });

  if (operationsError) {
    console.error("Error fetching operations:", operationsError);
  }

  const semanasDelAno = 52;

  const [formData, setFormData] = useState({
    ticketPromedio: 75000,
    promedioHonorariosNetos: 3,
    efectividad: 15,
  });

  const [inputValues, setInputValues] = useState({
    ticketPromedio: "75000",
    promedioHonorariosNetos: "3",
    efectividad: "15",
  });

  const [objetivoHonorariosAnuales, setObjetivoHonorariosAnuales] = useState(0);

  const { saveProjection, loadProjection } = useProjectionData();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (loadProjection.data && !loadProjection.isLoading) {
      const savedData = loadProjection.data;

      const ticketPromedio = savedData.ticketPromedio || 75000;
      const promedioHonorariosNetos = savedData.promedioHonorariosNetos || 3;
      const efectividad = savedData.efectividad || 15;

      setFormData({
        ticketPromedio,
        promedioHonorariosNetos,
        efectividad,
      });

      setInputValues({
        ticketPromedio: ticketPromedio.toString(),
        promedioHonorariosNetos: promedioHonorariosNetos.toString(),
        efectividad: efectividad.toString(),
      });

      if (savedData.objetivoHonorariosAnuales) {
        setObjetivoHonorariosAnuales(savedData.objetivoHonorariosAnuales);
      }
    }
  }, [loadProjection.data, loadProjection.isLoading]);

  const handleSave = () => {
    const esValido =
      objetivoHonorariosAnuales > 0 &&
      formData.promedioHonorariosNetos > 0 &&
      formData.efectividad > 0 &&
      formData.ticketPromedio > 0;

    const volumenAFacturar = esValido
      ? objetivoHonorariosAnuales / (formData.promedioHonorariosNetos / 100)
      : 0;

    const totalPuntasCierres = esValido
      ? Number(volumenAFacturar) / formData.ticketPromedio
      : 0;

    const totalPuntasCierresAnuales = esValido
      ? (Number(totalPuntasCierres) / formData.efectividad) * 100
      : 0;

    const totalPuntasCierresSemanales = esValido
      ? Number(totalPuntasCierresAnuales) / semanasDelAno
      : 0;

    const dataToSave = {
      ticketPromedio: formData.ticketPromedio,
      promedioHonorariosNetos: formData.promedioHonorariosNetos,
      efectividad: formData.efectividad,
      semanasDelAno,
      objetivoHonorariosAnuales,
      volumenAFacturar,
      totalPuntasCierres,
      totalPuntasCierresAnuales,
      totalPuntasCierresSemanales,
    };

    saveProjection.mutate(dataToSave, {
      onSuccess: () => {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      },
      onError: (error) => {
        console.error("Error al guardar la proyección:", error);
        setShowSuccessMessage(false);
      },
    });
  };

  if (isLoadingOperations || loadProjection.isLoading) {
    return (
      <div className="w-full">
        <SkeletonLoader height={60} count={10} />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center w-full">
      <div className="w-full mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">%</span>
          </div>
          <h2 className="text-lg md:text-2xl font-bold text-green-600">
            Proyección de Efectividad
          </h2>
        </div>
        <p className="text-xs md:text-sm text-gray-600 ml-11">
          Configura los parámetros para calcular tus proyecciones
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch w-full">
        <form className="flex flex-col flex-1">
          <div className="flex flex-col w-full">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 mb-4">
              <h3 className="font-bold text-green-600 mb-2">
                Edita los números para ver distintos escenarios
              </h3>
              <p className="text-xs text-gray-600">
                Ajusta estos valores para modelar diferentes escenarios de
                proyección
              </p>
            </div>
            <div className="flex flex-col w-full">
              <div className="w-full">
                <Input
                  label="Ticket Promedio"
                  type="text"
                  className="w-full"
                  labelSize="text-sm"
                  value={inputValues.ticketPromedio}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValues({
                      ...inputValues,
                      ticketPromedio: val,
                    });
                    if (val === "") {
                      setFormData({
                        ...formData,
                        ticketPromedio: 0,
                      });
                    } else if (!isNaN(Number(val))) {
                      setFormData({
                        ...formData,
                        ticketPromedio: Number(val),
                      });
                    }
                  }}
                  showTooltip={true}
                  tooltipContent="Cálculo del ticket promedio de las operaciones cerradas en el año."
                />
              </div>
              <div className="w-full">
                <Input
                  label="Promedio en % de honorarios netos"
                  type="text"
                  className="w-full"
                  labelSize="text-sm"
                  value={inputValues.promedioHonorariosNetos}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValues({
                      ...inputValues,
                      promedioHonorariosNetos: val,
                    });
                    if (val === "") {
                      setFormData({
                        ...formData,
                        promedioHonorariosNetos: 0,
                      });
                    } else if (!isNaN(Number(val))) {
                      setFormData({
                        ...formData,
                        promedioHonorariosNetos: Number(val),
                      });
                    }
                  }}
                  showTooltip={true}
                  tooltipContent="Cálculo del porcentaje promedio de los honorarios netos de las operaciones cerradas en el año."
                />
              </div>
              <div className="w-full">
                <Input
                  label="Efectividad (%)"
                  type="text"
                  className="w-full"
                  labelSize="text-sm"
                  value={inputValues.efectividad}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValues({
                      ...inputValues,
                      efectividad: val,
                    });
                    if (val === "") {
                      setFormData({
                        ...formData,
                        efectividad: 0,
                      });
                    } else if (!isNaN(Number(val))) {
                      setFormData({
                        ...formData,
                        efectividad: Number(val),
                      });
                    }
                  }}
                  showTooltip={true}
                  tooltipContent="Segun estadísticas de la industria, el asesor inmobiliario promedio tiene cerca de 15% de efectividad. Los asesores mas experimentados pueden llegar a alcanzar un 35% de efectividad."
                />
              </div>
              <div className="w-full">
                <Input
                  label="Semanas del Año"
                  type="number"
                  className="w-full"
                  labelSize="text-sm"
                  disabled
                  marginBottom="mb-2"
                  value={semanasDelAno}
                  showTooltip={true}
                  tooltipContent="Si bien el año tiene 48 semanas, se calculan 52 ya que en Diciembre se empieza a trabajar posibles cierres del año siguiente"
                />
              </div>
              {showSuccessMessage && (
                <div className="text-green-600 font-medium text-sm bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 w-full text-center shadow-sm mt-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    ¡Proyección Guardada con Éxito!
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
        <ProjectionsObjetive
          ticketPromedio={formData.ticketPromedio}
          promedioHonorariosNetos={formData.promedioHonorariosNetos}
          efectividad={formData.efectividad}
          semanasDelAno={semanasDelAno}
          onObjetivoChange={setObjetivoHonorariosAnuales}
          initialObjetivoValue={objetivoHonorariosAnuales}
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center mt-4 md:mt-6 justify-center gap-3 md:gap-4 w-full">
        <Button
          type="button"
          onClick={() => {
            const ticketPromedio = Number(inputValues.ticketPromedio) || 0;
            const promedioHonorariosNetos =
              Number(inputValues.promedioHonorariosNetos) || 0;
            const efectividad = Number(inputValues.efectividad) || 0;

            setFormData({
              ticketPromedio,
              promedioHonorariosNetos,
              efectividad,
            });
          }}
          className="h-[42px] w-full sm:w-[200px] bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-sm text-sm md:text-base"
        >
          Calcular Proyección
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="h-[42px] w-full sm:w-[200px] bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm text-sm md:text-base"
        >
          Guardar Proyección
        </Button>
      </div>
      {/* <p className="text-gray-500 mt-4">By Métricas Pablo Viti - 2025</p> */}
    </div>
  );
};

export default ProjectionsData;
