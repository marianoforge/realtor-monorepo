import * as yup from "yup";

export const userSchema = yup.object().shape({
  uid: yup.string().required("UID is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").nullable(),
  numeroTelefono: yup.string().nullable(),
});
