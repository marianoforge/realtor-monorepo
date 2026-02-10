import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

type WeekData = {
  actividadVerde: string;
  contactosReferidos: string;
  preBuying: string;
  preListing: string;
  captaciones: string;
  reservas: string;
  cierres: string;
  semana: number;
};

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

    if (req.method !== "POST") {
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });
    }

    const {
      weekNumber,
      userID,
      data,
    }: { weekNumber: number; userID: string; data: WeekData } = req.body;

    if (!weekNumber || !userID || !data) {
      return res.status(400).json({
        error: "weekNumber, userID, and data are required",
        payload: req.body,
      });
    }

    await db
      .collection("usuarios")
      .doc(userID)
      .collection("weeks")
      .doc(`week-${weekNumber}`)
      .set(data);

    return res.status(200).json({ message: "Week data updated successfully" });
  } catch (error) {
    console.error("Error en la API /api/week:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
