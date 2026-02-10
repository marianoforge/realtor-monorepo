import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  numeroTelefono?: string;
  [key: string]: any;
}

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

    const userRef = db.collection("usuarios").doc(userUID);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userSnap.data();
    if (userData?.role !== "team_leader_broker") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Insufficient permissions" });
    }

    if (req.method === "GET") {
      const teamsSnapshot = await db
        .collection("teams")
        .where("teamLeadID", "==", userUID)
        .get();

      if (teamsSnapshot.empty) {
        return res.status(200).json({ teamMembers: [], operations: [] });
      }

      const teamMembers: TeamMember[] = teamsSnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return data.isActive !== false;
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      const advisorUids: string[] = [];
      const teamMemberIds: string[] = [];

      const allUsuariosSnapshot = await db.collection("usuarios").get();
      const usuariosMap = new Map<string, string>();
      allUsuariosSnapshot.docs.forEach((doc) => {
        const email = doc.data().email?.toLowerCase().trim();
        if (email) {
          usuariosMap.set(email, doc.id);
        }
      });

      teamMembers.forEach((member) => {
        teamMemberIds.push(member.id);

        if (member.email) {
          const emailLower = member.email.toLowerCase().trim();
          const advisorUid = usuariosMap.get(emailLower);

          if (advisorUid) {
            advisorUids.push(advisorUid);
            member.advisorUid = advisorUid;
          }
        }
      });

      const chunkArray = <T>(array: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          chunks.push(array.slice(i, i + size));
        }
        return chunks;
      };

      const allSearchUids = Array.from(
        new Set([...advisorUids, ...teamMemberIds])
      );

      if (allSearchUids.length === 0) {
        return res.status(200).json({ teamMembers, operations: [] });
      }

      const allSearchUidChunks = chunkArray(allSearchUids, 30);

      const operationsResults = [];

      for (const chunk of allSearchUidChunks) {
        const chunkSnapshot = await db
          .collection("operations")
          .where("user_uid", "in", chunk)
          .get();

        operationsResults.push(...chunkSnapshot.docs);
      }

      const adicionalOperationsResults = [];

      for (const chunk of allSearchUidChunks) {
        const chunkSnapshot = await db
          .collection("operations")
          .where("user_uid_adicional", "in", chunk)
          .get();

        adicionalOperationsResults.push(...chunkSnapshot.docs);
      }

      const operationsMap = new Map();

      [...operationsResults, ...adicionalOperationsResults].forEach((doc) => {
        if (!operationsMap.has(doc.id)) {
          operationsMap.set(doc.id, {
            id: doc.id,
            ...doc.data(),
          });
        }
      });

      const operations = Array.from(operationsMap.values());

      return res.status(200).json({ teamMembers, operations });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("Error en la API /api/teamAdmin/getTeamData:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
