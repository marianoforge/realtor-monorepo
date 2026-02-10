import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlusIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Button from "@/components/PrivateComponente/FormComponents/Button";
import Input from "@/components/PrivateComponente/FormComponents/Input";
import Select from "@/components/PrivateComponente/FormComponents/Select";
import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";
import { auth } from "@/lib/firebase";
import {
  prospectionSchema,
  ProspectionFormData,
} from "@gds-si/shared-schemas/prospectionFormSchema";
import { ProspectionStatus, QueryKeys } from "@gds-si/shared-utils";

const Toast: React.FC<{
  type: "success" | "error";
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(
        () => {
          onClose();
        },
        type === "error" ? 4000 : 3000
      );
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, type]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-md">
      <div
        className={`
          transform transition-all duration-500 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          ${
            type === "success"
              ? "bg-green-50 border-l-4 border-green-400"
              : "bg-red-50 border-l-4 border-red-400"
          }
          p-4 rounded-lg shadow-lg border
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            ) : (
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message}
            </p>
          </div>
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === "success"
                  ? "text-green-500 hover:bg-green-100 focus:ring-green-600"
                  : "text-red-500 hover:bg-red-100 focus:ring-red-600"
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const createProspect = async (prospectData: ProspectionFormData) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch("/api/prospection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prospectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error creating prospect");
  }

  return response.json();
};

const ProspectionForm = () => {
  const [userUID, setUserUID] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false,
  });

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProspectionFormData>({
    resolver: yupResolver(prospectionSchema),
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUID(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const mutation = useMutation({
    mutationFn: createProspect,
    onSuccess: () => {
      setToast({
        type: "success",
        message: "Prospecto creado exitosamente",
        isVisible: true,
      });
      reset();
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OPERATIONS] });
    },
    onError: (error: Error) => {
      setToast({
        type: "error",
        message: error.message || "Error al crear el prospecto",
        isVisible: true,
      });
    },
  });

  const onSubmit: SubmitHandler<ProspectionFormData> = async (data) => {
    if (!userUID) {
      setToast({
        type: "error",
        message: "Error de autenticación. Por favor, recarga la página.",
        isVisible: true,
      });
      return;
    }

    const prospectData = {
      ...data,
      user_uid: userUID,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    mutation.mutate(prospectData);
  };

  const prospectionStatusOptions = Object.values(ProspectionStatus).map(
    (status) => ({
      value: status,
      label: status,
    })
  );

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 md:px-6 md:py-4 border-b border-blue-100">
          <div className="flex items-center gap-2 md:gap-3">
            <UserPlusIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-lg md:text-xl font-semibold text-blue-900">
              Agregar Nuevo Prospecto
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Nombre del Cliente */}
            <div>
              <Input
                label="Nombre del Cliente (Opcional)"
                type="text"
                placeholder="Ingrese el nombre completo"
                error={errors.nombre_cliente?.message}
                {...register("nombre_cliente")}
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email (Opcional)"
                type="email"
                placeholder="cliente@ejemplo.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Teléfono */}
            <div>
              <Input
                label="Teléfono (Opcional)"
                type="tel"
                placeholder="+54 11 1234-5678"
                error={errors.telefono?.message}
                {...register("telefono")}
              />
            </div>

            {/* Estado de Prospección */}
            <div className="pt-1">
              <Select
                label="Estado de Prospección (Opcional)"
                options={prospectionStatusOptions}
                register={register}
                name="estado_prospeccion"
                error={errors.estado_prospeccion?.message}
                className="py-2.5"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-4 md:mt-6">
            <TextArea
              label="Observaciones (Opcional)"
              placeholder="Notas adicionales sobre el prospecto..."
              rows={3}
              error={errors.observaciones?.message || ""}
              {...register("observaciones")}
            />
          </div>

          {/* Botón de Submit */}
          <div className="mt-6 md:mt-8 flex justify-center md:justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {mutation.isPending ? "Guardando..." : "Crear Prospecto"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProspectionForm;
