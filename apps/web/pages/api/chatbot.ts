import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/rateLimit";
import { generateRAGResponse, type Message } from "@/lib/knowledge/rag";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  if (!rateLimit(req, res, RATE_LIMIT_CONFIGS.chatbot)) {
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "No autorizado: Token no proporcionado" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    await adminAuth.verifyIdToken(token);
  } catch {
    return res
      .status(401)
      .json({ error: "No autorizado: Token inválido o expirado" });
  }

  const message = req.body.message?.trim() || "";
  const conversationHistory: Message[] = req.body.history || [];

  if (!message) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío" });
  }

  try {
    const reply = await generateRAGResponse(message, conversationHistory);

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("Error en el chatbot RAG:", error);

    return res.status(200).json({
      reply:
        "Lo siento, estoy teniendo problemas para responder en este momento. Por favor, intenta de nuevo más tarde o contáctanos por WhatsApp al +34 613 73 92 74.",
    });
  }
}
