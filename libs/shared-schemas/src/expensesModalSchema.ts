import * as yup from "yup";

export const schema = yup.object().shape({
  date: yup.string().required("La fecha es requerida"),
  amount: yup
    .number()
    .typeError("El monto debe ser un número")
    .required("El monto es requerido"),
  dollarRate: yup
    .number()
    .typeError("La cotización debe ser un número")
    .positive("La cotización debe ser positiva")
    .required("La cotización del dólar es requerida"),
  expenseType: yup.string().required("El tipo de gasto es requerido"),
  description: yup.string().required("La descripción es requerida"),
  otherType: yup.string().nullable(),
  expenseAssociationType: yup.string().nullable(),
  isRecurring: yup.boolean().default(false),
});
