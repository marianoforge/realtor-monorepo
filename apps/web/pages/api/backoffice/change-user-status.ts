import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import {
  validateSchema,
  changeUserStatusSchema,
  ApiResponder,
} from "@/lib/schemas";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  // Solo permitir POST
  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  try {
    // Validar body
    const validation = validateSchema(changeUserStatusSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { userId, newStatus } = validation.data;

    const userRef = db.collection("usuarios").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return respond.notFound("Usuario no encontrado");
    }

    const userData = userDoc.data();
    const oldStatus = userData?.subscriptionStatus;

    const updateData: any = {
      subscriptionStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (newStatus === "active") {
      if (userData?.stripeSubscriptionId === "trial") {
        updateData.stripeSubscriptionId = "active";
      }
    }

    await userRef.update(updateData);

    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    return respond.success(
      {
        user: {
          id: userId,
          email: updatedUserData?.email,
          subscriptionStatus: updatedUserData?.subscriptionStatus,
          stripeSubscriptionId: updatedUserData?.stripeSubscriptionId,
          updatedAt: updatedUserData?.updatedAt,
        },
      },
      `Status del usuario cambiado exitosamente de ${oldStatus} a ${newStatus}`
    );
  } catch (error) {
    console.error("Error al cambiar status del usuario:", error);
    return respond.internalError("Error al cambiar status del usuario");
  }
};

export default withBackofficeAuth(handler);
