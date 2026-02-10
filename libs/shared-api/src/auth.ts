import { signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";

import { auth } from "@gds-si/shared-stores";
import { apiClient } from "./apiClient";

export const loginWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { message: "Inicio de sesión exitoso", user: userCredential.user };
  } catch (error) {
    console.error(error);
    if (error instanceof FirebaseError) {
      throw error;
    }
    throw new Error("Error al iniciar sesión con email y contraseña.");
  }
};

export const resetPassword = async (email: string) => {
  const response = await apiClient.post("/api/auth/reset-password", {
    email,
  });
  return response.data;
};
