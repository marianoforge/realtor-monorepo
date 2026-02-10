import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/authMiddleware";
import { db } from "@/lib/firebaseAdmin";
import { validateSchema, deleteUserSchema, ApiResponder } from "@/lib/schemas";

/**
 * API endpoint para eliminar un usuario específico
 * Solo accesible para administradores del backoffice
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "DELETE") {
    return respond.methodNotAllowed();
  }

  try {
    // Verificar autenticación y autorización
    const decodedToken = await verifyToken(req, res);
    if (!decodedToken) return;

    // Verificar que sea el usuario autorizado para backoffice
    const isAuthorized =
      decodedToken.email === "mariano@bigbangla.biz" ||
      decodedToken.uid === "qaab6bRZHpZiRuq6981thD3mYm03";

    if (!isAuthorized) {
      return respond.forbidden("No tienes permisos para realizar esta acción");
    }

    // Validar body
    const validation = validateSchema(deleteUserSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { userId } = validation.data;

    const userDoc = await db.collection("usuarios").doc(userId).get();

    if (!userDoc.exists) {
      return respond.notFound("Usuario no encontrado");
    }

    const userData = userDoc.data();
    const userInfo = {
      id: userId,
      email: userData?.email || "Sin email",
      nombre: userData?.nombre || userData?.firstName || "Sin nombre",
    };

    await db.collection("usuarios").doc(userId).delete();

    return respond.success(
      { deletedUser: userInfo },
      `Usuario ${userInfo.email} eliminado exitosamente`
    );
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return respond.internalError("Error al eliminar usuario");
  }
}
