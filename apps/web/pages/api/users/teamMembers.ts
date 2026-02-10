import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { setCsrfCookie, validateCsrfToken } from "@/lib/csrf";
import { TeamMemberRequestBody } from "@gds-si/shared-types";
import { teamMemberSchema } from "@gds-si/shared-schemas/teamMemberSchema";

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
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    if (req.method === "GET") {
      return getTeamMembers(req, res);
    }

    if (req.method === "POST") {
      return createTeamMember(req, res, userUID);
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("Error en la API /api/teamMembers:", error);
    return res.status(500).json({ message: "Error en autenticación" });
  }
}

const getTeamMembers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const existingToken = req.cookies["csrfToken"];
    let csrfToken: string;
    if (!existingToken) {
      csrfToken = setCsrfCookie(res);
    } else {
      csrfToken = existingToken;
    }

    const [teamSnapshot, usuariosSnapshot] = await Promise.all([
      db.collection("teams").get(),
      db.collection("usuarios").get(),
    ]);

    const emailToUidMap = new Map<string, string>();
    usuariosSnapshot.docs.forEach((doc) => {
      const email = doc.data().email?.toLowerCase().trim();
      if (email) {
        emailToUidMap.set(email, doc.id);
      }
    });

    const teamMembersWithUid = teamSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        return data.isActive !== false;
      })
      .map((doc) => {
        const memberData = doc.data();
        let advisorUid = null;

        if (memberData.email) {
          const emailLower = memberData.email.toLowerCase().trim();
          advisorUid = emailToUidMap.get(emailLower) || null;
        }

        return {
          id: doc.id,
          ...memberData,
          advisorUid,
        };
      });

    return res.status(200).json({ csrfToken, teamMembers: teamMembersWithUid });
  } catch (error) {
    console.error("Error al obtener los miembros del equipo:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los miembros del equipo" });
  }
};

const createTeamMember = async (
  req: NextApiRequest,
  res: NextApiResponse,
  userUID: string
) => {
  const isValidCsrf = validateCsrfToken(req);
  if (!isValidCsrf) {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }

  const {
    email,
    numeroTelefono,
    firstName,
    lastName,
    objetivoAnual,
  }: TeamMemberRequestBody = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    await teamMemberSchema.validate(req.body, { abortEarly: false });

    const newMemberRef = await db.collection("teams").add({
      email: email || "",
      numeroTelefono: numeroTelefono || "",
      firstName,
      lastName,
      objetivoAnual: objetivoAnual || null,
      teamLeadID: userUID,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      id: newMemberRef.id,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
};
