import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { FAQs } from "@/lib/faqs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const chatCollection = collection(db, "chat_responses");

    for (const faq of FAQs) {
      await addDoc(chatCollection, faq);
    }

    return res.status(200).json({ message: "FAQs guardadas correctamente." });
  } catch (error) {
    console.error("Error guardando FAQs:", error);
    return res.status(500).json({ error: "Error al guardar FAQs." });
  }
}
