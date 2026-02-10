import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    const { user_uid } = req.query;

    if (!user_uid || typeof user_uid !== "string") {
      return res.status(400).json({ message: "User UID is required" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const userDoc = await db.collection("usuarios").doc(user_uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();
    const currencySymbol = userData?.currencySymbol;

    if (!currencySymbol) {
      return res.status(404).json({ message: "Currency symbol not found" });
    }

    return res.status(200).json({ currencySymbol });
  } catch (error) {
    console.error("Error en la API /api/currency-symbol:", error);
    return res.status(500).json({ message: "Error fetching currency symbol" });
  }
}
