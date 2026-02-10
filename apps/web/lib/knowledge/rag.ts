import { getOpenAIClient } from "@/lib/openai/client";
import { searchVectors, type SearchResult } from "@/lib/pinecone/operations";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const RAG_MODEL = "gpt-4o";
const TOP_K_RESULTS = 8;
const MAX_CONTEXT_LENGTH = 6000;

export interface Message {
  role: "user" | "assistant";
  content: string;
}

function buildSystemPrompt(context: string): string {
  return `Eres el asistente virtual oficial de Realtor Trackpro, una plataforma de gestión integral para agentes inmobiliarios y brokers. Tu nombre es "TrackBot".

## TU MISIÓN
Ayudar a los usuarios a entender y usar la plataforma de la mejor manera posible. Debes ser su guía experta, resolviendo todas sus dudas de forma clara, completa y práctica.

## CÓMO DEBES RESPONDER

### Formato de respuestas:
- Usa un tono amigable, profesional y cercano (como un colega experto que quiere ayudar)
- Estructura tus respuestas con claridad usando listas o pasos cuando sea apropiado
- Si la pregunta involucra un proceso (como crear una operación), explica paso a paso
- Incluye ejemplos prácticos cuando sea útil para clarificar
- Si hay varios aspectos en la pregunta, responde a cada uno

### Nivel de detalle:
- Da respuestas COMPLETAS, no te limites a lo mínimo
- Si el usuario pregunta "cómo hago X", explica todo el proceso
- Anticipa dudas relacionadas que el usuario pueda tener
- Si hay tips o mejores prácticas, menciónalas

### Cuando NO tengas información:
- Indica claramente qué parte de la pregunta no puedes responder
- Sugiere contactar al soporte por WhatsApp: +34 613 73 92 74
- O por email: info@realtortrackpro.com
- NO inventes información que no esté en el contexto

### Tipos de preguntas que puedes responder:
- Cómo usar cada sección de la plataforma
- Cómo crear operaciones, gastos, prospectos
- Diferencias entre roles (Asesor vs Broker)
- Configuración y ajustes
- Gestión de equipo (para Brokers)
- Reportes y estadísticas
- Calendario y seguimiento
- Cualquier funcionalidad de Realtor Trackpro

### Si la pregunta NO es sobre Realtor Trackpro:
- Amablemente indica que solo puedes ayudar con temas de la plataforma
- Ofrece ayudar con alguna duda que sí puedas resolver

## CONTEXTO DE LA DOCUMENTACIÓN
Usa la siguiente información de nuestra base de conocimiento para responder:

${context || "No hay documentación cargada en este momento. Por favor, contacta al soporte para más ayuda."}

---
Recuerda: Tu objetivo es que el usuario salga de la conversación habiendo resuelto su duda completamente.`;
}

function formatDocsForPrompt(results: SearchResult[]): string {
  if (results.length === 0) {
    return "";
  }

  let context = "";
  let currentLength = 0;

  for (const result of results) {
    const section = result.metadata.section
      ? `[${result.metadata.section}] `
      : "";
    const docInfo = `Fuente: ${result.metadata.documentName}\n`;
    const content = `${section}${result.content}\n\n`;

    const entryLength = docInfo.length + content.length;

    if (currentLength + entryLength > MAX_CONTEXT_LENGTH) {
      break;
    }

    context += docInfo + content;
    currentLength += entryLength;
  }

  return context.trim();
}

export async function generateRAGResponse(
  query: string,
  conversationHistory: Message[] = []
): Promise<string> {
  const relevantDocs = await searchVectors(query, { topK: TOP_K_RESULTS });

  const context = formatDocsForPrompt(relevantDocs);

  const openai = getOpenAIClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(context) },
  ];

  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  messages.push({ role: "user", content: query });

  const response = await openai.chat.completions.create({
    model: RAG_MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1500,
  });

  return (
    response.choices[0]?.message?.content ??
    "Lo siento, no pude generar una respuesta."
  );
}

export async function searchKnowledge(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  return searchVectors(query, { topK });
}
