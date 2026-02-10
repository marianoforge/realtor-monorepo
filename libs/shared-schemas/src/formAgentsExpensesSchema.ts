import * as yup from "yup";

export const schema = yup.object().shape({
  expenseType: yup.string().required("El tipo de gasto es requerido"),
  date: yup.string().required("La fecha es requerida"),
  amount: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue.trim() === "" ? undefined : value;
    })
    .required("El monto es requerido"),
  dollarRate: yup
    .number()
    .transform((value, originalValue) => {
      return originalValue.trim() === "" ? undefined : value;
    })
    .positive("La cotización del dólar debe ser un número positivo")
    .required("La cotización del dólar es requerida"),
  description: yup.string(),
  otherType: yup
    .string()
    .when("expenseType", ([expenseType], schema: yup.StringSchema) => {
      return expenseType === "Otros"
        ? schema.required("Debes especificar el tipo de gasto")
        : schema;
    }),
  teamMember: yup.string().required("El agente es requerido"),
});
