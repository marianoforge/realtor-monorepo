import * as yup from "yup";

export const schema = yup.object().shape({
  title: yup.string().required("El título es obligatorio"),
  date: yup.string().required("La fecha es obligatoria"),
  startTime: yup.string().required("La hora de inicio es obligatoria"),
  endTime: yup.string().required("La hora de fin es obligatoria"),
  eventType: yup.string().required("El tipo de evento es obligatorio"),
  address: yup.string(),
  description: yup.string(),
  syncWithGoogle: yup.boolean().optional(),
  googleCalendarId: yup.string().when("syncWithGoogle", {
    is: true,
    then: (schema) => schema.required("Selecciona un calendario de Google"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
