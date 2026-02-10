import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useAuthStore } from "@/stores/authStore";

import Input from "../PrivateComponente/FormComponents/Input";
import Button from "../PrivateComponente/FormComponents/Button";
import TextArea from "../PrivateComponente/FormComponents/TextArea";

interface ContactFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  country: string;
  inquiry: string;
}

const schema = yup.object().shape({
  firstName: yup.string().required("Nombre es requerido"),
  lastName: yup.string().required("Apellido es requerido"),
  email: yup
    .string()
    .email("Email no es válido")
    .required("Email es requerido"),
  phoneNumber: yup.string().required("Número de teléfono es requerido"),
  companyName: yup.string().required("Nombre de la compañía es requerido"),
  country: yup.string().required("País es requerido"),
  inquiry: yup.string().required("Consulta es requerida"),
});

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: yupResolver(schema),
  });

  const [status, setStatus] = useState("");

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    setStatus("Enviando...");

    try {
      const token = await useAuthStore.getState().getAuthToken();
      if (!token) throw new Error("User not authenticated");

      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("Correo enviado exitosamente.");
        onClose();
      } else {
        setStatus("Error al enviar el correo.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Error al enviar el correo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
      <div className="bg-white p-6 pt-4 rounded-xl shadow-lg text-center font-bold w-auto h-auto max-h-[90vh] overflow-y-auto flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-row flex-wrap gap-4 justify-center items-center w-[600px]"
        >
          <Input
            label="Nombre"
            {...register("firstName")}
            error={errors.firstName?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <Input
            label="Apellido"
            {...register("lastName")}
            error={errors.lastName?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <Input
            label="Email"
            {...register("email")}
            error={errors.email?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <Input
            label="Número de Teléfono"
            {...register("phoneNumber")}
            error={errors.phoneNumber?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <Input
            label="Nombre de la Compañía"
            {...register("companyName")}
            error={errors.companyName?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <Input
            label="País"
            {...register("country")}
            error={errors.country?.message}
            className="w-[280px] p-2 border border-gray-300 rounded"
          />
          <div className="w-full mb-4">
            <TextArea
              label="Consulta"
              {...register("inquiry")}
              error={errors.inquiry?.message}
              className="w-[95%] p-2 border border-gray-300 rounded"
            />
          </div>
          <Button
            type="submit"
            label="Enviar"
            className="text-white p-2 rounded bg-mediumBlue hover:bg-lightBlue transition-all duration-300 font-semibold w-[160px]"
          />
          <Button
            type="button"
            onClick={onClose}
            label="Cerrar"
            className="text-white p-2 rounded bg-lightBlue hover:bg-mediumBlue transition-all duration-300 font-semibold w-[160px]"
          />
        </form>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
};

export default ContactForm;
