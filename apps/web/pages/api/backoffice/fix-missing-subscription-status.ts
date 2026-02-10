import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Solo permitir POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const usersSnapshot = await db.collection("usuarios").get();

    const batch = db.batch();
    let updatedCount = 0;
    let alreadyHaveStatus = 0;

    const updates: any[] = [];

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();

      if (user.subscriptionStatus) {
        alreadyHaveStatus++;
        continue;
      }

      let subscriptionStatus = "inactive";

      if (user.stripeSubscriptionId === "trial") {
        subscriptionStatus = "trialing";
      } else if (
        user.stripeSubscriptionId &&
        user.stripeSubscriptionId !== "trial"
      ) {
        subscriptionStatus = "active";
      } else if (!user.stripeSubscriptionId) {
        subscriptionStatus = "inactive";
      }

      const userRef = db.collection("usuarios").doc(doc.id);
      batch.update(userRef, {
        subscriptionStatus: subscriptionStatus,
        subscriptionStatusUpdatedAt: new Date().toISOString(),
      });

      updates.push({
        id: doc.id,
        email: user.email,
        oldStatus: user.subscriptionStatus || "undefined",
        newStatus: subscriptionStatus,
        stripeSubscriptionId: user.stripeSubscriptionId,
      });

      updatedCount++;

      if (updatedCount % 500 === 0) {
        await batch.commit();
      }
    }

    if (updatedCount % 500 !== 0) {
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      message: "Corrección de subscriptionStatus completada exitosamente",
      stats: {
        totalProcessed: updatedCount + alreadyHaveStatus,
        updated: updatedCount,
        alreadyHadStatus: alreadyHaveStatus,
      },
      updates: updates.slice(0, 10),
      totalUpdates: updates.length,
    });
  } catch (error) {
    console.error("Error al corregir subscriptionStatus:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default withBackofficeAuth(handler);
