import * as yup from "yup";

export const schema = yup.object().shape({
  email: yup.string().email("Correo inválido").required("Correo es requerido"),
  password: yup
    .string()
    .min(6, "Contraseña debe tener al menos 6 caracteres")
    .required("Contraseña es requerida"),
});
