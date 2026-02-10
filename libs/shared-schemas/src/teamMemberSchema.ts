import * as yup from "yup";

export const teamMemberSchema = yup.object().shape({
  firstName: yup.string().required("Nombre es requerido"),
  lastName: yup.string().required("Apellido es requerido"),
  email: yup.string().email("Correo inválido").nullable(),
  numeroTelefono: yup.string().nullable(),
  objetivoAnual: yup
    .number()
    .transform((value, originalValue) => {
      // Transformar string vacío, null o undefined a undefined para hacerlo opcional
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return undefined;
      }
      return value;
    })
    .nullable()
    .positive("El objetivo anual debe ser un número positivo")
    .optional(),
});
