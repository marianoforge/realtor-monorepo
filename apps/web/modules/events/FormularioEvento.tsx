import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Input from "@/components/PrivateComponente/FormComponents/Input";
import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";
import Button from "@/components/PrivateComponente/FormComponents/Button";
import { useEventMutation } from "@/common/hooks/useEventMutation";
import ModalOK from "@/components/PrivateComponente/CommonComponents/Modal";
import { schema } from "@gds-si/shared-schemas/eventFormSchema";
import ConnectGoogleButton from "@/components/PrivateComponente/GoogleCalendar/ConnectGoogleButton";
import GoogleCalendarSelector from "@/components/PrivateComponente/GoogleCalendar/GoogleCalendarSelector";
import { EventType } from "@gds-si/shared-utils";

const FormularioEvento: React.FC = () => {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [syncWithGoogle, setSyncWithGoogle] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      syncWithGoogle: false,
      googleCalendarId: "",
    },
  });

  const watchSyncWithGoogle = watch("syncWithGoogle");

  const { isModalOpen, modalMessage, onSubmit, closeModal, acceptModal } =
    useEventMutation(reset);

  const handleSyncToggle = (checked: boolean) => {
    setSyncWithGoogle(checked);
    setValue("syncWithGoogle", checked);
    if (!checked) {
      setSelectedCalendarId("");
      setValue("googleCalendarId", "");
    }
  };

  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendarId(calendarId);
    setValue("googleCalendarId", calendarId);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 bg-white rounded-lg shadow-md w-full xl:w-[80%] 2xl:w-[70%]"
      >
        <h2 className="text-2xl mb-4 font-semibold">Agendar Evento</h2>
        <div className="flex flex-wrap -mx-2">
          <div className="w-full px-2">
            <Input
              label="Título del evento"
              type="text"
              placeholder="Título del evento"
              {...register("title")}
              error={errors.title?.message}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de evento *
              </label>
              <select
                {...register("eventType")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona un tipo de evento</option>
                {Object.values(EventType).map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
              {errors.eventType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.eventType.message}
                </p>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <Input
                  label="Fecha del evento"
                  type="date"
                  {...register("date")}
                  error={errors.date?.message}
                  required
                />
              </div>
              <div className="w-1/2">
                <Input
                  label="Dirección del Evento"
                  type="text"
                  {...register("address")}
                  error={errors.address?.message}
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <Input
                  label="Hora de inicio"
                  type="time"
                  {...register("startTime")}
                  error={errors.startTime?.message}
                  required
                />
              </div>
              <div className="w-1/2">
                <Input
                  label="Hora de fin"
                  type="time"
                  {...register("endTime")}
                  error={errors.endTime?.message}
                  required
                />
              </div>
            </div>

            <TextArea
              label="Descripción del evento"
              placeholder="Descripción del evento"
              {...register("description")}
              error={errors.description?.message}
            />

            {/* Google Calendar Integration Section */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">
                Sincronización con Google Calendar
              </h3>

              <ConnectGoogleButton
                onConnectionChange={setGoogleConnected}
                className="mb-4"
              />

              {googleConnected && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="syncWithGoogle"
                      checked={syncWithGoogle}
                      onChange={(e) => handleSyncToggle(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="syncWithGoogle"
                      className="text-sm font-medium text-gray-700"
                    >
                      Sincronizar este evento con Google Calendar
                    </label>
                  </div>

                  {syncWithGoogle && (
                    <GoogleCalendarSelector
                      value={selectedCalendarId}
                      onChange={handleCalendarSelect}
                      error={errors.googleCalendarId?.message}
                      required={watchSyncWithGoogle}
                      className="mt-3"
                    />
                  )}

                  {syncWithGoogle && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                      💡 <strong>Tip:</strong> Al crear este evento, también se
                      creará automáticamente en tu Google Calendar seleccionado.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center mt-8">
          <Button
            type="submit"
            className="bg-mediumBlue hover:bg-lightBlue text-white p-2 rounded  transition-all duration-300 font-semibold w-[200px] cursor-pointer"
          >
            Guardar Evento
          </Button>
        </div>
        <ModalOK
          isOpen={isModalOpen}
          onClose={closeModal}
          message={modalMessage}
          onAccept={acceptModal}
        />
      </form>
    </div>
  );
};

export default FormularioEvento;
