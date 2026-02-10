import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import * as XLSX from "xlsx";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

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

    const querySnapshot = await db
      .collection("operations")
      .where("teamId", "==", userUID)
      .orderBy("fecha_operacion", "asc")
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "No operations found" });
    }

    const operations = querySnapshot.docs.map((doc) => doc.data());

    const worksheet = XLSX.utils.json_to_sheet(operations);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operaciones");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="operaciones.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error al exportar operaciones:", error);
    return res.status(500).json({ message: "Error exporting operations" });
  }
}
