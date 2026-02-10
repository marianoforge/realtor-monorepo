import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ message: "userId is required" });
    }

    try {
      await adminAuth.getUser(userId);
    } catch (error: any) {
      console.error("Usuario no encontrado en Firebase Auth:", userId);
      return res
        .status(404)
        .json({ message: "User not found in Firebase Auth" });
    }

    const customToken = await adminAuth.createCustomToken(userId);

    return res.status(200).json({ customToken });
  } catch (error: any) {
    console.error("Error creando custom token:", error);
    return res.status(500).json({
      message: "Error creating custom token",
      error: error.message,
    });
  }
}
