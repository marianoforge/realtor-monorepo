import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";

import { adminAuth } from "@/lib/firebaseAdmin";
import {
  updateExpenseSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";

const db = getFirestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "Expense ID inválido" },
          ])
        );
    }

    switch (req.method) {
      case "GET":
        return getExpenseById(idValidation.data, res);
      case "PUT":
        return updateExpense(idValidation.data, req.body, res);
      case "DELETE":
        return deleteExpense(idValidation.data, res);
      default:
        return respond.methodNotAllowed();
    }
  } catch (error: unknown) {
    console.error("Error en la autenticación:", error);
    return respond.internalError();
  }
}

const getExpenseById = async (id: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("expenses").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return respond.notFound("Gasto no encontrado");
    }

    return respond.success({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error obteniendo gasto:", error);
    return respond.internalError("Error al obtener gasto");
  }
};

const updateExpense = async (
  id: string,
  updatedData: unknown,
  res: NextApiResponse
) => {
  const respond = new ApiResponder(res);

  try {
    // Validar datos de actualización con Zod
    const validation = validateSchema(updateExpenseSchema, updatedData);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const docRef = db.collection("expenses").doc(id);

    const cleanData = Object.fromEntries(
      Object.entries(validation.data).filter(
        (entry): entry is [string, unknown] => entry[1] !== undefined
      )
    );
    delete (cleanData as Record<string, unknown>).id;

    await docRef.update({
      ...cleanData,
      updatedAt: new Date().toISOString(),
    });

    return respond.success({ id }, "Gasto actualizado exitosamente");
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    return respond.internalError("Error al actualizar gasto");
  }
};

const deleteExpense = async (id: string, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  try {
    const docRef = db.collection("expenses").doc(id);
    await docRef.delete();

    return respond.success({ id }, "Gasto eliminado exitosamente");
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    return respond.internalError("Error al eliminar gasto");
  }
};
