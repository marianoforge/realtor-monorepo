import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

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

    const { ids } = req.query;

    if (req.method === "GET") {
      try {
        const teamMemberIds = Array.isArray(ids)
          ? ids
          : ids?.split(",").map((id) => id.trim());

        if (!teamMemberIds || teamMemberIds.length === 0) {
          return res
            .status(400)
            .json({ message: "Team member IDs are required" });
        }

        const teamMemberPromises = teamMemberIds.map(async (teamMemberId) => {
          const teamMemberDoc = await db
            .collection("teams")
            .doc(teamMemberId)
            .get();

          if (!teamMemberDoc.exists) {
            return null;
          }

          const teamMemberData = teamMemberDoc.data();
          if (!teamMemberData) {
            return null;
          }

          const { firstName = "", lastName = "" } = teamMemberData;

          const expensesSnapshot = await db
            .collection(`teams/${teamMemberId}/expenses`)
            .get();
          const expenses = expensesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return { id: teamMemberId, firstName, lastName, expenses };
        });

        const usersWithExpenses = (
          await Promise.all(teamMemberPromises)
        ).filter(Boolean);

        return res.status(200).json({ usersWithExpenses });
      } catch (error) {
        console.error("Error obteniendo gastos de miembros del equipo:", error);
        return res
          .status(500)
          .json({ message: "Error fetching team member expenses" });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error en la API /api/teamMembers/expenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
