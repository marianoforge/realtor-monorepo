import { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

const firebaseConfig = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
  });
}

const db = admin.firestore();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const collections = await db.listCollections();
    const backupData: Record<string, any[]> = {};

    for (const collection of collections) {
      const snapshot = await collection.get();
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      backupData[collection.id] = documents;
    }

    const jsonData = JSON.stringify(backupData, null, 2);
    const jsonPath = path.join(process.cwd(), "public", "backup.json");
    fs.writeFileSync(jsonPath, jsonData, "utf8");

    const wb = XLSX.utils.book_new();
    Object.keys(backupData).forEach((sheetName) => {
      const ws = XLSX.utils.json_to_sheet(backupData[sheetName]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const xlsxPath = path.join(process.cwd(), "public", "backup.xlsx");
    XLSX.writeFile(wb, xlsxPath);

    return res.status(200).json({
      message: "Backup completed successfully",
      jsonUrl: "/backup.json",
      xlsxUrl: "/backup.xlsx",
    });
  } catch (error) {
    console.error("Error en el respaldo:", error);
    return res.status(500).json({
      message: "Error generating backup",
      error: error instanceof Error ? error.message : error,
    });
  }
}
