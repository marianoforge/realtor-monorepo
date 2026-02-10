import type { NextApiRequest, NextApiResponse } from "next";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import { deleteByDocumentId } from "@/lib/pinecone/operations";
import { db } from "@/lib/firebaseAdmin";
import { z } from "zod";

const deleteSchema = z.object({
  documentId: z.string().min(1, "El ID del documento es requerido"),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const validation = deleteSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: validation.error.issues,
    });
  }

  const { documentId } = validation.data;

  try {
    const docRef = db.collection("knowledgeDocuments").doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Documento no encontrado",
      });
    }

    const docData = doc.data();

    await deleteByDocumentId(documentId);

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: `Documento "${docData?.filename}" eliminado correctamente`,
    });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return res.status(500).json({
      error: "Error al eliminar documento",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export default withBackofficeAuth(handler);
