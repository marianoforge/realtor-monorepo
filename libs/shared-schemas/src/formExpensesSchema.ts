import * as yup from "yup";

export const getSchema = (currency: string | null) => {
  return yup.object({
    date: yup.string().required("La fecha es requerida"),
    amount: yup
      .number()
      .transform((value, originalValue) => {
        return originalValue.trim() === "" ? undefined : value;
      })
      .required("El monto es requerido"),
    expenseType: yup.string().required("El tipo de gasto es requerido"),
    description: yup.string().optional(),
    otherType: yup.string().when("expenseType", {
      is: (val: string) => val === "Otros",
      then: (schema) => schema.required("Debe especificar el tipo de gasto"),
      otherwise: (schema) => schema,
    }),
    dollarRate:
      currency === "USD"
        ? yup
            .number()
            .transform((value, originalValue) => {
              if (
                originalValue === undefined ||
                originalValue === null ||
                originalValue.trim === undefined
              )
                return undefined;
              return originalValue.trim() === "" ? undefined : value;
            })
            .positive("La cotización del dólar debe ser un número positivo")
            .required("La cotización del dólar es requerida")
        : yup.number().optional(),
  });
};

export const schema = getSchema("non-USD");
