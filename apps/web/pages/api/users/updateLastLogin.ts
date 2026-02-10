import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, db } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Validar token de Firebase
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Actualizar última fecha de acceso
    const userRef = db.collection("usuarios").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRef.update({
      lastLoginDate: new Date().toISOString(),
    });

    return res.status(200).json({
      message: "Last login date updated successfully",
      lastLoginDate: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating last login date:", error.message);
    return res.status(500).json({
      message: "Error updating last login date",
      error: error.message,
    });
  }
}
