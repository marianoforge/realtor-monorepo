import React from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XMarkIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import { useAuthStore } from "@/stores/authStore";

export interface WeekData {
  actividadVerde?: string | undefined;
  contactosReferidos?: string | undefined;
  preBuying?: string | undefined;
  preListing?: string | undefined;
  captaciones?: string | undefined;
  reservas?: string | undefined;
  cierres?: string | undefined;
  postVenta?: string | undefined;
  semana?: number;
}

interface ProjectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: WeekData;
  userID: string;
}

const schema = yup.object().shape({
  actividadVerde: yup.string(),
  contactosReferidos: yup.string(),
  preBuying: yup.string(),
  preListing: yup.string(),
  captaciones: yup.string(),
  reservas: yup.string(),
  cierres: yup.string(),
  postVenta: yup.string(),
  semana: yup.number(),
});

const ProjectionsModal: React.FC<ProjectionsModalProps> = ({
  isOpen,
  onClose,
  rowData,
  userID,
}) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: WeekData) => {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch("/api/updateWeek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekNumber: rowData.semana,
          userID,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update week data");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeks", userID] });
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      actividadVerde: rowData.actividadVerde,
      contactosReferidos: rowData.contactosReferidos,
      preBuying: rowData.preBuying,
      preListing: rowData.preListing,
      captaciones: rowData.captaciones,
      reservas: rowData.reservas,
      cierres: rowData.cierres,
      postVenta: rowData.postVenta,
      semana: rowData.semana,
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: WeekData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Editar Manualmente Proyección Semanal
                </h2>
                <p className="text-green-100 text-sm">
                  Semana {rowData.semana} - Aquí aparecen sólo los eventos
                  agregados manualmente
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
              type="button"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Contenido del formulario */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <Controller
              name="actividadVerde"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Prospección"
                  error={errors.actividadVerde?.message as string}
                />
              )}
            />
            <Controller
              name="contactosReferidos"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Contactos / Referidos"
                  error={errors.contactosReferidos?.message as string}
                />
              )}
            />
            <Controller
              name="preBuying"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Pre Buying"
                  error={errors.preBuying?.message as string}
                />
              )}
            />
            <Controller
              name="preListing"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Pre Listing"
                  error={errors.preListing?.message as string}
                />
              )}
            />
            <Controller
              name="captaciones"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Captaciones"
                  error={errors.captaciones?.message as string}
                />
              )}
            />
            <Controller
              name="reservas"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Reservas"
                  error={errors.reservas?.message as string}
                />
              )}
            />
            <Controller
              name="cierres"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Cierres"
                  error={errors.cierres?.message as string}
                />
              )}
            />
            <Controller
              name="postVenta"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Post-venta"
                  error={errors.postVenta?.message as string}
                />
              )}
            />
            {/* Botones de acción */}
            <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Cancelar
              </Button>
            </div>

            {/* Mensajes de estado */}
            {mutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">
                  Error guardando los datos. Inténtalo de nuevo.
                </p>
              </div>
            )}
            {mutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-green-600 text-sm font-medium">
                    Datos guardados con éxito.
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsModal;
