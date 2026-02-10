import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Error verificando token:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const querySnapshot = await db
      .collection("usuarios")
      .where("email", "==", email)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = querySnapshot.docs[0].id;
    res.status(200).json({ userId });
  } catch (error: any) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({
      message: "Error fetching user by email",
      error: error instanceof Error ? error.message : String(error),
      code: error?.code,
    });
  }
}
