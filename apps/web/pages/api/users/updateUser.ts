import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, db } from "@/lib/firebaseAdmin";
import { updateUserSchema, validateSchema, ApiResponder } from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split("Bearer ")[1];
        await adminAuth.verifyIdToken(token);
      } catch {
        // Token inválido, continuar
      }
    }

    // Validar body con Zod
    const validation = validateSchema(updateUserSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionStatus,
      role,
      trialStartDate,
      trialEndDate,
    } = validation.data;

    const userRef = db.collection("usuarios").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return respond.notFound("Usuario no encontrado");
    }

    const updateData: {
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      subscriptionStatus: string;
      role?: string;
      trialStartDate?: string;
      trialEndDate?: string;
    } = {
      stripeCustomerId,
      stripeSubscriptionId,
      subscriptionStatus,
    };

    if (role) {
      updateData.role = role;
    }

    if (trialStartDate) {
      updateData.trialStartDate = trialStartDate;
    }

    if (trialEndDate) {
      updateData.trialEndDate = trialEndDate;
    }

    try {
      await userRef.update(updateData);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedSnap = await userRef.get();

      if (!updatedSnap.exists) {
        throw new Error("Document no longer exists after update");
      }

      const updatedData = updatedSnap.data();

      const updateSuccess =
        updatedData?.stripeCustomerId === stripeCustomerId &&
        updatedData?.stripeSubscriptionId === stripeSubscriptionId &&
        updatedData?.subscriptionStatus === subscriptionStatus;

      if (!updateSuccess) {
        throw new Error("Data verification failed after update");
      }

      return respond.success(
        {
          updated: updateData,
          verified: {
            stripeCustomerId: updatedData?.stripeCustomerId,
            stripeSubscriptionId: updatedData?.stripeSubscriptionId,
            subscriptionStatus: updatedData?.subscriptionStatus,
          },
        },
        "Usuario actualizado exitosamente"
      );
    } catch (updateError: any) {
      console.error("Error en userRef.update():", updateError);
      throw updateError;
    }
  } catch (error: any) {
    console.error("Error actualizando usuario:", error.message);
    return respond.internalError("Error al actualizar usuario");
  }
}
