import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const weeksSnapshot = await db
        .collection("usuarios")
        .doc(userId)
        .collection("weeks")
        .get();

      const weeks = weeksSnapshot.docs.map((doc) => ({
        id: doc.id,
        semana: doc.data().semana,
        ...doc.data(),
      }));

      return res.status(200).json(weeks);
    } catch (error) {
      console.error("Error al obtener semanas:", error);
      return res.status(500).json({ error: "Failed to fetch weeks" });
    }
  } catch (error) {
    console.error("Error en la API /api/weeks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
