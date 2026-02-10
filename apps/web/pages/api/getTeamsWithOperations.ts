import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

type TeamMember = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  numeroTelefono?: string;
  objetivoAnual?: number;
  role?: string | null;
  uid?: string | null;
  [key: string]: string | number | Operation[] | null | undefined; // Extendable properties
};

type Operation = {
  id: string;
  user_uid: string;
  user_uid_adicional?: string | null; // ✅ Permite que sea string o null
  teamId: string; // ✅ ID del equipo al que pertenece la operación
} & {
  [key: string]: string | Operation[] | undefined; // ✅ Permite valores undefined sin error
};

type TeamMemberWithOperations = TeamMember & {
  operations: Operation[];
};

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
    const teamLeaderUID = decodedToken.uid;

    const [teamMembersSnapshot, operationsSnapshot, teamLeaderSnapshot] =
      await Promise.all([
        db.collection("teams").where("teamLeadID", "==", teamLeaderUID).get(),
        db.collection("operations").where("teamId", "==", teamLeaderUID).get(),
        db.collection("usuarios").doc(teamLeaderUID).get(),
      ]);

    const activeTeamMemberDocs = teamMembersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.isActive !== false;
    });

    const teamMemberIds = activeTeamMemberDocs.map((doc) => doc.id);
    const userDataPromises = teamMemberIds.map((memberId) =>
      db.collection("usuarios").doc(memberId).get()
    );
    const userDataSnapshots = await Promise.all(userDataPromises);

    const teamMembers: TeamMember[] = activeTeamMemberDocs.map((doc, index) => {
      const userData = userDataSnapshots[index].data();
      return {
        id: doc.id,
        ...doc.data(),
        role: userData?.role || null,
        uid: userData?.uid || doc.id,
      };
    }) as TeamMember[];

    const operations: Operation[] = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      user_uid: doc.data().user_uid,
      user_uid_adicional: doc.data().user_uid_adicional ?? null,
      teamId: doc.data().teamId,
      ...doc.data(),
    })) as Operation[];

    const teamLeaderOperations = operations.filter((op) => {
      if (op.teamId !== teamLeaderUID) return false;

      const isPrimaryAdvisor = op.user_uid && op.user_uid === teamLeaderUID;
      const isAdditionalAdvisor =
        op.user_uid_adicional && op.user_uid_adicional === teamLeaderUID;

      const hasNoAdvisorAssigned =
        !op.user_uid || op.user_uid === "" || op.user_uid === null;

      return isPrimaryAdvisor || isAdditionalAdvisor || hasNoAdvisorAssigned;
    });

    const result: TeamMemberWithOperations[] = teamMembers.map((member) => {
      const memberOperations = operations.filter((op) => {
        const isPrimaryAdvisor = op.user_uid && op.user_uid === member.id;
        const isAdditionalAdvisor =
          op.user_uid_adicional && op.user_uid_adicional === member.id;

        return isPrimaryAdvisor || isAdditionalAdvisor;
      });

      return { ...member, operations: memberOperations };
    });

    if (teamLeaderOperations.length > 0 && teamLeaderSnapshot.exists) {
      const isTeamLeaderAlreadyIncluded = result.some(
        (member) => member.id === teamLeaderUID
      );

      if (!isTeamLeaderAlreadyIncluded) {
        const teamLeaderData = teamLeaderSnapshot.data();
        const teamLeaderMember: TeamMemberWithOperations = {
          id: teamLeaderUID,
          email: teamLeaderData?.email || "",
          firstName: teamLeaderData?.firstName || "Team",
          lastName: teamLeaderData?.lastName || "Leader",
          teamLeadID: teamLeaderUID,
          numeroTelefono: teamLeaderData?.numeroTelefono || "",
          objetivoAnual: teamLeaderData?.objetivoAnual || undefined,
          role: teamLeaderData?.role || null,
          uid: teamLeaderUID,
          operations: teamLeaderOperations,
        };

        result.push(teamLeaderMember);
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en la API /api/getTeamsWithOperations:", error);
    return res.status(500).json({ error: "Failed to fetch data" });
  }
}
