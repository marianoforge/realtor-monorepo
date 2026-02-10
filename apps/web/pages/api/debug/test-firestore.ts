import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const usersRef = db.collection("usuarios");
    const snapshot = await usersRef.limit(5).get();

    const users: {
      id: string;
      email: string;
      role: string;
      fechaCreacion: string;
    }[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email || "N/A",
        role: data.role || "N/A",
        fechaCreacion: data.fechaCreacion || data.createdAt || "N/A",
      });
    });

    const allSnapshot = await usersRef.get();
    const totalUsers = allSnapshot.size;

    return res.status(200).json({
      success: true,
      totalUsers,
      sampleUsers: users,
      message: `Found ${totalUsers} total users in collection 'usuarios'`,
    });
  } catch (error) {
    console.error("Firestore test error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to connect to Firestore",
    });
  }
}
