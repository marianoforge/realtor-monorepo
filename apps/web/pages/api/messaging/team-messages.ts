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
    const userID = decodedToken.uid;

    const currentUserDoc = await db.collection("usuarios").doc(userID).get();
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
        .where("teamLeadID", "==", userID)
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
            memberUIDs.push(userSnapshot.docs[0].id);
          }
        }
      }

      teamUserUIDs = [userID, ...memberUIDs];
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
          if (memberData.email) {
            const userSnapshot = await db
              .collection("usuarios")
              .where("email", "==", memberData.email)
              .get();

            if (!userSnapshot.empty) {
              memberUIDs.push(userSnapshot.docs[0].id);
            }
          }
        }

        teamUserUIDs = [teamLeaderUID, userID, ...memberUIDs];
      } else {
        teamUserUIDs = [userID];
      }
    }

    const [sentMessagesSnapshot, receivedMessagesSnapshot] = await Promise.all([
      db
        .collection("messages")
        .where("senderId", "==", userID)
        .orderBy("timestamp", "desc")
        .get(),
      db
        .collection("messages")
        .where("receiverId", "==", userID)
        .orderBy("timestamp", "desc")
        .get(),
    ]);

    const allMessages: any[] = [];

    sentMessagesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (teamUserUIDs.includes(data.receiverId)) {
        allMessages.push({
          id: doc.id,
          ...data,
          timestamp:
            data.timestamp?.toDate?.() ||
            new Date(data.createdAt || Date.now()),
          type: "sent",
        });
      }
    });

    receivedMessagesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (teamUserUIDs.includes(data.senderId)) {
        allMessages.push({
          id: doc.id,
          ...data,
          timestamp:
            data.timestamp?.toDate?.() ||
            new Date(data.createdAt || Date.now()),
          type: "received",
        });
      }
    });

    allMessages.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const conversationMap = new Map();

    for (const message of allMessages) {
      const otherParticipantId =
        message.senderId === userID ? message.receiverId : message.senderId;
      const conversationId = [userID, otherParticipantId].sort().join("_");

      if (!conversationMap.has(conversationId)) {
        let participantName = "";
        if (message.type === "received") {
          participantName = message.senderName;
        } else {
          const participantDoc = await db
            .collection("usuarios")
            .doc(otherParticipantId)
            .get();

          if (participantDoc.exists) {
            const participantData = participantDoc.data();
            participantName =
              `${participantData?.firstName || ""} ${participantData?.lastName || ""}`.trim();
          }
        }

        conversationMap.set(conversationId, {
          ...message,
          participantName: participantName || "Usuario desconocido",
          participantId: otherParticipantId,
        });
      }
    }

    const recentMessages = Array.from(conversationMap.values()).slice(0, 10);

    return res.status(200).json({
      messages: recentMessages,
      totalMessages: allMessages.length,
      teamUserCount: teamUserUIDs.length,
    });
  } catch (error) {
    console.error("❌ Error fetching team messages:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
