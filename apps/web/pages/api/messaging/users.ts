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

    const usersSnapshot = await db
      .collection("usuarios")
      .select("firstName", "lastName", "email", "fcmToken", "lastSeen")
      .get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      const user = {
        uid: doc.id,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        email: data.email || "",
        fcmToken: data.fcmToken || null,
        lastSeen: data.lastSeen || null,
        online: data.fcmToken ? true : false,
      };

      return user;
    });

    const includeCurrentUser = req.query.includeCurrentUser === "true";
    const filteredUsers = includeCurrentUser
      ? users
      : users.filter((user) => user.uid !== decodedToken.uid);

    return res.status(200).json({
      users: filteredUsers,
    });
  } catch (error) {
    console.error("Error fetching users for messaging:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
