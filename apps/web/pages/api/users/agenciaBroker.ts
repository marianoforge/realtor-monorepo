import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { agenciaBroker } = req.query;
  if (!agenciaBroker || typeof agenciaBroker !== "string") {
    return res
      .status(400)
      .json({ message: "agenciaBroker is required and must be a string" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    const querySnapshot = await db
      .collection("usuarios")
      .where("agenciaBroker", "==", agenciaBroker)
      .get();

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error obteniendo usuarios de agenciaBroker:", error);
    return res.status(500).json({ message: "Error fetching users", error });
  }
}
