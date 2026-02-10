import React, { useState, useEffect, useCallback } from "react";

import { TeamMember } from "./AgentsReport";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCloseAndUpdate: () => void;
  member: TeamMember;
  onSubmit: (member: TeamMember) => void;
};

const EditAgentsModal = ({
  isOpen,
  onCloseAndUpdate,
  member,
  onSubmit,
}: ModalProps) => {
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [numeroTelefono, setNumeroTelefono] = useState(
    member.numeroTelefono || ""
  );
  const [objetivoAnual, setObjetivoAnual] = useState(
    member.objetivoAnual != null ? member.objetivoAnual.toString() : ""
  );

  useEffect(() => {
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email);
    setNumeroTelefono(member.numeroTelefono || "");
    setObjetivoAnual(
      member.objetivoAnual != null ? member.objetivoAnual.toString() : ""
    );
  }, [member]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const updatedMember = {
        ...member,
        firstName,
        lastName,
        email,
        numeroTelefono,
        objetivoAnual: objetivoAnual !== "" ? Number(objetivoAnual) : undefined,
      };
      onSubmit(updatedMember);
      onCloseAndUpdate();
    },
    [
      member,
      firstName,
      lastName,
      email,
      numeroTelefono,
      objetivoAnual,
      onSubmit,
      onCloseAndUpdate,
    ]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg min-w-[360px] sm:min-w-[600px]">
        <h2 className="text-xl font-bold mb-4">Editar Miembro</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre:</label>
            <input
              className="border p-2 w-full mb-4"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label>Apellido:</label>
            <input
              className="border p-2 w-full mb-4"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              className="border p-2 w-full mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Número de Teléfono:</label>
            <input
              type="tel"
              className="border p-2 w-full mb-4"
              value={numeroTelefono}
              onChange={(e) => setNumeroTelefono(e.target.value)}
            />
          </div>
          <div>
            <label>Objetivo Anual:</label>
            <input
              type="number"
              className="border p-2 w-full mb-4"
              value={objetivoAnual}
              onChange={(e) => setObjetivoAnual(e.target.value)}
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

export default EditAgentsModal;
