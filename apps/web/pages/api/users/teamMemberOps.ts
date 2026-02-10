import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { setCsrfCookie } from "@/lib/csrf";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
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

    const { teamLeadID } = req.query;
    if (!teamLeadID || typeof teamLeadID !== "string") {
      return res.status(400).json({ message: "teamLeadID es requerido" });
    }

    const csrfToken = setCsrfCookie(res);

    const teamsSnapshot = await db
      .collection("teams")
      .where("teamLeadID", "==", teamLeadID)
      .get();
    const teamMembers = teamsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const membersWithOperations = await Promise.all(
      teamMembers.map(async (member) => {
        const [primarySnapshot, additionalSnapshot] = await Promise.all([
          db.collection("operations").where("user_uid", "==", member.id).get(),
          db
            .collection("operations")
            .where("user_uid_adicional", "==", member.id)
            .get(),
        ]);

        const operaciones = [
          ...primarySnapshot.docs.map((opDoc) => opDoc.data()),
          ...additionalSnapshot.docs.map((opDoc) => opDoc.data()),
        ];

        return { ...member, operaciones };
      })
    );

    return res.status(200).json({ csrfToken, membersWithOperations });
  } catch (error) {
    console.error("Error obteniendo miembros del equipo y operaciones:", error);
    return res
      .status(500)
      .json({ message: "Error fetching team members and operations" });
  }
}
