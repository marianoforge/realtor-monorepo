import type { NextApiRequest, NextApiResponse } from "next";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import { db } from "@/lib/firebaseAdmin";

interface KnowledgeDocument {
  id: string;
  filename: string;
  chunksCount: number;
  tags: string[];
  createdAt: string;
  contentPreview: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const snapshot = await db
      .collection("knowledgeDocuments")
      .orderBy("createdAt", "desc")
      .get();

    const documents: KnowledgeDocument[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      documents.push({
        id: data.id,
        filename: data.filename,
        chunksCount: data.chunksCount,
        tags: data.tags || [],
        createdAt: data.createdAt,
        contentPreview: data.contentPreview || "",
      });
    });

    return res.status(200).json({
      success: true,
      documents,
      total: documents.length,
    });
  } catch (error) {
    console.error("Error al listar documentos:", error);
    return res.status(500).json({
      error: "Error al obtener documentos",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export default withBackofficeAuth(handler);
