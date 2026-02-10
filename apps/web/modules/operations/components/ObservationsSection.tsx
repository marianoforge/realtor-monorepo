import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import TextArea from "@/components/PrivateComponente/FormComponents/TextArea";

import FormSectionWrapper from "./FormSectionWrapper";

interface ObservationsSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  sectionNumber?: number;
  className?: string;
}

const ObservationsSection: React.FC<ObservationsSectionProps> = ({
  register,
  errors,
  sectionNumber = 7,
  className = "",
}) => {
  return (
    <FormSectionWrapper
      icon={<DocumentTextIcon className="w-5 h-5" />}
      title="Información Adicional"
      sectionNumber={sectionNumber}
      className={`additional-info-section ${className}`}
    >
      <TextArea
        className="w-full"
        label="Observaciones"
        placeholder="Información adicional sobre la operación..."
        {...register("observaciones")}
        error={errors.observaciones?.message as string}
      />
    </FormSectionWrapper>
  );
};

export default ObservationsSection;
