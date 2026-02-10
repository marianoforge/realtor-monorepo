import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { safeToDate } from "@/common/utils/firestoreUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Solo permitir peticiones POST para esta operación
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const apiKey = req.headers["x-api-key"];
    if (!process.env.CRON_API_KEY || apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({
        message: "Unauthorized access",
        hint: "Add CRON_API_KEY environment variable in .env.local and Vercel project settings",
      });
    }

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const usersSnapshot = await db
      .collection("usuarios")
      .where("stripeSubscriptionId", "==", "trial")
      .where("trialEndDate", "<", cutoffDate)
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json({
        message: "No expired trial users to cleanup",
        deletedCount: 0,
      });
    }

    const deletedUsers = [];
    const batchSize = 500;
    let batch = db.batch();
    let operationCount = 0;

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      const email = userData.email;
      const trialEndDate = safeToDate(userData.trialEndDate);

      try {
        await adminAuth.deleteUser(userId);

        batch.delete(doc.ref);
        deletedUsers.push({
          userId,
          email,
          trialEndDate: trialEndDate?.toISOString(),
        });
        operationCount++;

        if (operationCount >= batchSize) {
          await batch.commit();
          batch = db.batch();
          operationCount = 0;
        }
      } catch (error) {
        console.error(`Error eliminando usuario ${email}:`, error);
        continue;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return res.status(200).json({
      message: "Expired trial users cleaned up successfully",
      deletedCount: deletedUsers.length,
      deletedUsers: deletedUsers.map((u) => ({
        email: u.email,
        trialEndDate: u.trialEndDate,
      })),
    });
  } catch (error) {
    console.error("Error en limpieza de trials expirados:", error);
    return res.status(500).json({
      message: "Error cleaning up expired trial users",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
