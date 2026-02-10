import { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    const currentUserDoc = await db.collection("usuarios").doc(userUID).get();
    if (!currentUserDoc.exists) {
      return res.status(404).json({ error: "Current user not found" });
    }

    const currentUserData = currentUserDoc.data();
    const currentUserRole = currentUserData?.role;
    const currentUserEmail = currentUserData?.email;

    let teamUserUIDs: string[] = [];

    if (currentUserRole === "team_leader_broker") {
      const teamMembersSnapshot = await db
        .collection("teams")
        .where("teamLeadID", "==", userUID)
        .get();

      const memberUIDs: string[] = [];
      for (const memberDoc of teamMembersSnapshot.docs) {
        const memberData = memberDoc.data();
        if (memberData.email) {
          const userSnapshot = await db
            .collection("usuarios")
            .where("email", "==", memberData.email)
            .get();

          if (!userSnapshot.empty) {
            const memberUID = userSnapshot.docs[0].id;
            memberUIDs.push(memberUID);
          }
        }
      }

      teamUserUIDs = [userUID, ...memberUIDs]; // Incluir al Team Leader
    } else {
      const teamMemberSnapshot = await db
        .collection("teams")
        .where("email", "==", currentUserEmail)
        .get();

      if (!teamMemberSnapshot.empty) {
        const teamData = teamMemberSnapshot.docs[0].data();
        const teamLeaderUID = teamData.teamLeadID;

        const allTeamMembersSnapshot = await db
          .collection("teams")
          .where("teamLeadID", "==", teamLeaderUID)
          .get();

        const memberUIDs: string[] = [];
        for (const memberDoc of allTeamMembersSnapshot.docs) {
          const memberData = memberDoc.data();
          if (memberData.email && memberData.email !== currentUserEmail) {
            const userSnapshot = await db
              .collection("usuarios")
              .where("email", "==", memberData.email)
              .get();

            if (!userSnapshot.empty) {
              const memberUID = userSnapshot.docs[0].id;
              memberUIDs.push(memberUID);
            }
          }
        }

        teamUserUIDs = [teamLeaderUID, userUID, ...memberUIDs];
      } else {
        teamUserUIDs = [userUID];
      }
    }

    if (teamUserUIDs.length === 0) {
      return res.status(200).json({ users: [] });
    }

    const chunkArray = <T>(array: T[], size: number): T[][] => {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    const userChunks = chunkArray(teamUserUIDs, 10);
    const allUsers: any[] = [];

    for (const chunk of userChunks) {
      const usersSnapshot = await db
        .collection("usuarios")
        .where("__name__", "in", chunk)
        .get();

      chunk.forEach((uid) => {
        const userDoc = usersSnapshot.docs.find((doc) => doc.id === uid);
        if (userDoc) {
          const userData = userDoc.data();
          allUsers.push({
            uid: uid,
            name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            email: userData.email || "",
            role: userData.role || "",
            fcmToken: userData.fcmToken || null,
            lastSeen: userData.lastSeen || null,
            online: userData.fcmToken ? true : false,
          });
        }
      });
    }

    // Filtrar al usuario actual de la lista (no necesita enviarse mensajes a sí mismo)
    const filteredUsers = allUsers.filter((user) => user.uid !== userUID);

    return res.status(200).json({
      users: filteredUsers,
      totalTeamUsers: allUsers.length,
      currentUserRole: currentUserRole,
    });
  } catch (error) {
    console.error("❌ Error fetching team users:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
