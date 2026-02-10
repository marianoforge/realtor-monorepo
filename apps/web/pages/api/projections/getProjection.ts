import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { commonSchemas } from "@/lib/schemas";
import { getCache, setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

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

    const { userID } = req.query;

    // Validar userID con Zod
    const userIDValidation = commonSchemas.userUid.safeParse(userID);
    if (!userIDValidation.success) {
      return res.status(400).json({
        message: "Error de validación en los datos enviados",
        code: "VALIDATION_ERROR",
        errors: [{ field: "userID", message: "userID es requerido" }],
      });
    }

    const cacheKey = CACHE_KEYS.projections(userIDValidation.data);

    const cachedData = await getCache<Record<string, unknown>>(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const docRef = db
      .collection("usuarios")
      .doc(userIDValidation.data)
      .collection("datos_proyeccion")
      .doc("current");

    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(200).json({ exists: false });
    }

    const data = doc.data();
    const responseData = { ...data, exists: true };

    await setCache(cacheKey, responseData, CACHE_TTL.PROJECTIONS);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error en la API /api/projections/getProjection:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
