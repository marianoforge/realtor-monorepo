import * as yup from "yup";

/**
 * Schema de validación para formulario de prospección
 * Todos los campos son opcionales
 */
export const prospectionSchema = yup.object().shape({
  nombre_cliente: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),

  email: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .email("Debe ser un email válido")
    .max(255, "El email no puede tener más de 255 caracteres"),

  telefono: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .test(
      "min-length",
      "El teléfono debe tener al menos 8 dígitos",
      (value) => !value || value.length >= 8
    )
    .max(20, "El teléfono no puede tener más de 20 caracteres"),

  estado_prospeccion: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired(),

  observaciones: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .notRequired()
    .max(500, "Las observaciones no pueden tener más de 500 caracteres"),
});

export type ProspectionFormData = yup.InferType<typeof prospectionSchema>;
