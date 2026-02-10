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

    const { ids, id: agentId, expenseId } = req.query;

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
        console.error("Error obteniendo miembros del equipo y gastos:", error);
        return res
          .status(500)
          .json({ message: "Error fetching team members and expenses" });
      }
    }

    if (req.method === "POST") {
      if (!agentId || typeof agentId !== "string") {
        return res.status(400).json({ message: "Agent ID is required" });
      }

      const expenseData = req.body;
      if (!expenseData || Object.keys(expenseData).length === 0) {
        return res.status(400).json({ message: "Expense data is required" });
      }

      try {
        const newExpenseRef = await db
          .collection(`teams/${agentId}/expenses`)
          .add({
            ...expenseData,
            createdAt: new Date().toISOString(),
          });

        return res.status(201).json({
          message: "Gasto agregado exitosamente",
          id: newExpenseRef.id,
        });
      } catch (error) {
        console.error("Error agregando gasto:", error);
        return res.status(500).json({ message: "Error adding expense" });
      }
    }

    if (req.method === "DELETE") {
      if (
        !agentId ||
        typeof agentId !== "string" ||
        !expenseId ||
        typeof expenseId !== "string"
      ) {
        return res
          .status(400)
          .json({ message: "Agent ID and Expense ID are required" });
      }

      try {
        await db.doc(`teams/${agentId}/expenses/${expenseId}`).delete();

        return res
          .status(200)
          .json({ message: "Gasto eliminado exitosamente" });
      } catch (error) {
        console.error("Error eliminando gasto:", error);
        return res.status(500).json({ message: "Error deleting expense" });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Error en la API /api/teamExpenses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
