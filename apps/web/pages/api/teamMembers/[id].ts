import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import {
  updateTeamMemberSchema,
  validateSchema,
  commonSchemas,
  ApiResponder,
  apiError,
} from "@/lib/schemas";

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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const { id } = req.query;

    // Validar ID con Zod
    const idValidation = commonSchemas.firestoreId.safeParse(id);
    if (!idValidation.success) {
      return res
        .status(400)
        .json(
          apiError("Error de validación", "VALIDATION_ERROR", [
            { field: "id", message: "Team member ID inválido" },
          ])
        );
    }

    const memberRef = db.collection("teams").doc(idValidation.data);
    const memberSnap = await memberRef.get();

    if (!memberSnap.exists) {
      return respond.notFound("Miembro no encontrado");
    }

    const memberData = memberSnap.data();

    if (memberData?.teamLeadID !== userUID) {
      return respond.forbidden(
        "No tienes permiso para modificar este miembro del equipo"
      );
    }

    if (req.method === "DELETE") {
      await memberRef.update({ isActive: false });
      return respond.success(
        { id: idValidation.data },
        "Miembro desactivado exitosamente"
      );
    }

    if (req.method === "PUT") {
      // Validar datos con Zod
      const validation = validateSchema(updateTeamMemberSchema, req.body);
      if (!validation.success) {
        return respond.validationError(validation.errors);
      }

      const { firstName, lastName, email, numeroTelefono, objetivoAnual } =
        validation.data;

      if (
        !firstName &&
        !lastName &&
        !email &&
        !numeroTelefono &&
        objetivoAnual === undefined
      ) {
        return respond.badRequest("No hay campos para actualizar");
      }

      const updateData: Record<string, unknown> = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (numeroTelefono !== undefined)
        updateData.numeroTelefono = numeroTelefono;
      if (objetivoAnual !== undefined) updateData.objetivoAnual = objetivoAnual;

      await memberRef.update(updateData);

      return respond.success(
        { id: idValidation.data },
        "Miembro actualizado exitosamente"
      );
    }

    return respond.methodNotAllowed();
  } catch (error) {
    console.error("Error en la API /api/teamMember:", error);
    return respond.internalError();
  }
}
