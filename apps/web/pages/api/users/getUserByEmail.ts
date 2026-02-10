import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const userRecord = await adminAuth.getUserByEmail(email);

    return res.status(200).json({
      userId: userRecord.uid,
      email: userRecord.email,
      createdAt: userRecord.metadata.creationTime,
    });
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return res
        .status(404)
        .json({ message: "User not found in Firebase Auth" });
    }

    console.error("Error buscando usuario por email:", error);
    return res.status(500).json({
      message: "Error fetching user by email",
      error: error.message,
    });
  }
}
