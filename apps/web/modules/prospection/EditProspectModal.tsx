import React, { useState, useEffect, useCallback } from "react";

import { Prospect } from "@gds-si/shared-types";
import { ProspectionStatus } from "@gds-si/shared-utils";

type EditProspectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAndUpdate: () => void;
  prospect: Prospect;
  onSubmit: (prospect: Prospect) => void;
};

const EditProspectModal = ({
  isOpen,
  onCloseAndUpdate,
  prospect,
  onSubmit,
}: EditProspectModalProps) => {
  const [nombreCliente, setNombreCliente] = useState(prospect.nombre_cliente);
  const [email, setEmail] = useState(prospect.email);
  const [telefono, setTelefono] = useState(prospect.telefono);
  const [estadoProspeccion, setEstadoProspeccion] = useState(
    prospect.estado_prospeccion
  );
  const [observaciones, setObservaciones] = useState(
    prospect.observaciones || ""
  );

  useEffect(() => {
    setNombreCliente(prospect.nombre_cliente);
    setEmail(prospect.email);
    setTelefono(prospect.telefono);
    setEstadoProspeccion(prospect.estado_prospeccion);
    setObservaciones(prospect.observaciones || "");
  }, [prospect]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const updatedProspect: Prospect = {
        ...prospect,
        nombre_cliente: nombreCliente,
        email,
        telefono,
        estado_prospeccion: estadoProspeccion,
        observaciones: observaciones || null,
        fecha_actualizacion: new Date().toISOString(),
      };
      onSubmit(updatedProspect);
      onCloseAndUpdate();
    },
    [
      prospect,
      nombreCliente,
      email,
      telefono,
      estadoProspeccion,
      observaciones,
      onSubmit,
      onCloseAndUpdate,
    ]
  );

  const prospectionStatusOptions = Object.values(ProspectionStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg min-w-[360px] sm:min-w-[600px]">
        <h2 className="text-xl font-bold mb-4">Editar Prospecto</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre del Cliente:</label>
            <input
              className="border p-2 w-full mb-4"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              className="border p-2 w-full mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Teléfono:</label>
            <input
              type="tel"
              className="border p-2 w-full mb-4"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label>Estado de Prospección:</label>
            <select
              className="border p-2 w-full mb-4"
              value={estadoProspeccion}
              onChange={(e) => setEstadoProspeccion(e.target.value)}
            >
              {prospectionStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Observaciones:</label>
            <textarea
              className="border p-2 w-full mb-4 h-24 resize-none"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre el prospecto..."
            />
          </div>
          <div className="flex justify-center gap-4 items-center">
            <button
              type="submit"
              className="bg-lightBlue hover:bg-mediumBlue transition-all duration-300 text-white p-2 rounded-lg w-48"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              className="bg-mediumBlue hover:bg-lightBlue transition-all duration-300 text-white p-2 rounded-lg w-48"
              onClick={onCloseAndUpdate}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProspectModal;
