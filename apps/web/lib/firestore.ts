import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  DocumentData,
  addDoc,
  query,
  where,
} from "firebase/firestore";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const calculateJaccardSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));
  const intersection = new Set(
    Array.from(set1).filter((word) => set2.has(word))
  );
  const union = new Set([...Array.from(set1), ...Array.from(set2)]);
  return intersection.size / union.size;
};

interface ChatResponse extends DocumentData {
  keywords: string[];
  answer: string;
}

export const getStoredResponse = async (message: string) => {
  try {
    const chatCollection = collection(db, "chat_responses");
    const snapshot = await getDocs(chatCollection);

    let bestMatch: ChatResponse | null = null;
    let highestScore = 0.0;

    const normalizedMessage = normalizeText(message);

    snapshot.forEach((doc) => {
      const data = doc.data() as ChatResponse;
      const keywords: string[] = data.keywords || [];

      keywords.forEach((keyword) => {
        const similarity = calculateJaccardSimilarity(
          normalizedMessage,
          normalizeText(keyword)
        );
        if (similarity > highestScore) {
          highestScore = similarity;
          bestMatch = data;
        }
      });
    });

    return highestScore >= 0.3 && bestMatch
      ? (bestMatch as ChatResponse).answer
      : null;
  } catch (error) {
    console.error("Error buscando respuesta en Firestore:", error);
    return null;
  }
};

export const saveResponse = async (question: string, answer: string) => {
  try {
    const chatCollection = collection(db, "chat_responses");
    const docRef = await addDoc(chatCollection, {
      keywords: [question],
      answer: answer,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error guardando respuesta en Firestore:", error);
    return null;
  }
};

export const saveUnansweredQuestion = async (
  question: string,
  answer: string | null = null
) => {
  try {
    const unansweredCollection = collection(db, "unanswered_questions");

    const q = query(unansweredCollection, where("question", "==", question));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return;
    }

    await addDoc(unansweredCollection, {
      question,
      suggestedAnswer: answer ?? "No hay respuesta aún.",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error guardando pregunta sin respuesta:", error);
  }
};
