import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

import Input from "@/components/PrivateComponente/FormComponents/Input";

import FormSectionWrapper from "./FormSectionWrapper";

interface ReservationsSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  sectionNumber?: number;
  className?: string;
}

const ReservationsSection: React.FC<ReservationsSectionProps> = ({
  register,
  errors,
  sectionNumber = 4,
  className = "",
}) => {
  return (
    <FormSectionWrapper
      icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
      title="Reservas y Refuerzos"
      sectionNumber={sectionNumber}
      className={`reservations-section ${className}`}
    >
      <Input
        label="Tipo de reserva"
        type="text"
        placeholder="Por ejemplo: Sobre nº / Transferencia"
        {...register("numero_sobre_reserva")}
        error={errors.numero_sobre_reserva?.message as string}
        className="w-full"
      />

      <Input
        label="Monto de Reserva"
        type="number"
        step="any"
        placeholder="Por ejemplo: 2000.50"
        {...register("monto_sobre_reserva")}
        error={errors.monto_sobre_reserva?.message as string}
        className="w-full"
      />

      <Input
        label="Tipo de refuerzo"
        type="text"
        placeholder="Por ejemplo: Sobre nº / Transferencia"
        {...register("numero_sobre_refuerzo")}
        error={errors.numero_sobre_refuerzo?.message as string}
        className="w-full"
      />

      <Input
        label="Monto de refuerzo"
        type="number"
        step="any"
        placeholder="Por ejemplo: 4000.25"
        {...register("monto_sobre_refuerzo")}
        error={errors.monto_sobre_refuerzo?.message as string}
        className="w-full"
      />
    </FormSectionWrapper>
  );
};

export default ReservationsSection;
