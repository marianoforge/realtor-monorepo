import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";

interface OfficeData {
  [key: string]: {
    office: string;
    teamLeadData?: any;
    [key: string]: any;
  };
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
    await adminAuth.verifyIdToken(token);

    if (req.method === "GET") {
      const targetUID = "8nP1fBedNXgS9lRhvwQcFnq2YTf2";

      const userRef = db.collection("usuarios").doc(targetUID);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const officesSnapshot = await userRef.collection("offices").get();

      if (officesSnapshot.empty) {
        return res.status(200).json({ operations: [] });
      }

      const officeUIDs = officesSnapshot.docs.map((doc) => doc.id);
      const officeData: OfficeData = {};

      for (const doc of officesSnapshot.docs) {
        const officeId = doc.id;
        const officeInfo = doc.data();

        try {
          const teamLeadRef = db.collection("usuarios").doc(officeId);
          const teamLeadSnap = await teamLeadRef.get();

          officeData[officeId] = {
            office: officeInfo.office || officeId,
            teamLeadData: teamLeadSnap.exists ? teamLeadSnap.data() : null,
            ...officeInfo,
          };
        } catch (error) {
          officeData[officeId] = {
            office: officeInfo.office || officeId,
            teamLeadData: null,
            ...officeInfo,
          };
        }
      }

      const operationsSnapshot = await db
        .collection("operations")
        .where("teamId", "in", officeUIDs)
        .get();

      if (operationsSnapshot.empty) {
        return res.status(200).json({ operations: [], offices: officeData });
      }

      const operations = operationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({ operations, offices: officeData });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("Error en la API /api/officeAdmin/getOfficesData:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
