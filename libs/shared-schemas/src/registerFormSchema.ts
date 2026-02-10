import * as yup from "yup";

export const createSchema = (googleUser: boolean) =>
  yup.object().shape({
    firstName: yup.string().required("Nombre es requerido"),
    lastName: yup.string().required("Apellido es requerido"),
    email: yup
      .string()
      .email("Correo inválido")
      .required("Correo es requerido"),
    agenciaBroker: yup.string().required("Agencia o Broker es requerido"),
    numeroTelefono: yup.string().required("Número de Teléfono es requerido"),
    ...(googleUser !== true && {
      password: yup
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(100, "La contraseña es muy larga")
        .matches(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
        .matches(/[a-z]/, "La contraseña debe contener al menos una minúscula")
        .matches(/[0-9]/, "La contraseña debe contener al menos un número")
        .required("Contraseña es requerida"),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref("password"), undefined], "Las contraseñas no coinciden")
        .required("Confirmar contraseña es requerido"),
    }),
    currency: yup.string(),
    currencySymbol: yup.string(),
    noUpdates: yup.boolean(),
  });
