import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { userSchema } from "@gds-si/shared-schemas/userSchema";

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

    if (req.method === "GET") {
      try {
        const csrfToken = setCsrfCookie(res);

        const usuariosSnapshot = await db.collection("usuarios").get();
        const usuarios = usuariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const usersWithOperations = await Promise.all(
          usuarios.map(async (usuario) => {
            const operationsSnapshot = await db
              .collection("operations")
              .where("user_uid", "==", usuario.id)
              .get();

            const operaciones = operationsSnapshot.docs.map((opDoc) =>
              opDoc.data()
            );

            return { ...usuario, operaciones };
          })
        );

        return res.status(200).json({ csrfToken, usersWithOperations });
      } catch (error) {
        console.error("Error obteniendo datos:", error);
        return res
          .status(500)
          .json({ message: "Error fetching users and operations" });
      }
    }

    if (req.method === "POST") {
      const isValidCsrf = validateCsrfToken(req);
      if (!isValidCsrf) {
        return res.status(403).json({ message: "Invalid CSRF token" });
      }

      try {
        await userSchema.validate(req.body, { abortEarly: false });

        const { uid, email, numeroTelefono, firstName, lastName } = req.body;

        const newUserRef = await db.collection("usuarios").add({
          uid,
          email,
          numeroTelefono,
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
        });

        return res.status(201).json({
          message: "User created successfully",
          id: newUserRef.id,
        });
      } catch (error) {
        console.error("Error al crear usuario:", error);
        return res.status(500).json({ message: "Error creating user" });
      }
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error en la API /api/usersWithOps:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
