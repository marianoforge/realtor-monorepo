import type { NextApiRequest, NextApiResponse } from "next";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import { chunkMarkdown, extractTags } from "@/lib/knowledge/chunker";
import { upsertChunks } from "@/lib/pinecone/operations";
import { db } from "@/lib/firebaseAdmin";
import { z } from "zod";

const uploadSchema = z.object({
  content: z.string().min(1, "El contenido no puede estar vacío"),
  filename: z.string().min(1, "El nombre del archivo es requerido"),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const validation = uploadSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Datos inválidos",
      details: validation.error.issues,
    });
  }

  const { content, filename } = validation.data;

  try {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    console.log(
      `[Knowledge Upload] Processing: ${filename}, content length: ${content.length}`
    );

    const chunks = chunkMarkdown(content, documentId, filename);

    console.log(`[Knowledge Upload] Generated ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return res.status(400).json({
        error:
          "No se pudo extraer contenido del documento. Asegúrate de que el archivo tenga texto.",
      });
    }

    const tags = extractTags(content);
    console.log(`[Knowledge Upload] Extracted tags: ${tags.join(", ")}`);

    const { upsertedCount } = await upsertChunks(chunks, tags);
    console.log(`[Knowledge Upload] Upserted ${upsertedCount} vectors`);

    await db
      .collection("knowledgeDocuments")
      .doc(documentId)
      .set({
        id: documentId,
        filename,
        chunksCount: chunks.length,
        tags,
        createdAt: new Date().toISOString(),
        contentPreview: content.substring(0, 200),
      });

    return res.status(200).json({
      success: true,
      documentId,
      chunksCount: upsertedCount,
      message: `Documento "${filename}" indexado correctamente con ${upsertedCount} chunks`,
    });
  } catch (error) {
    console.error("Error al subir documento:", error);
    return res.status(500).json({
      error: "Error al procesar el documento",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}

export default withBackofficeAuth(handler);
