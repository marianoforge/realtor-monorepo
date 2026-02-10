import type { NextApiRequest, NextApiResponse } from "next";
import {
  getCachedNews,
  setCachedNews,
  shouldUpdateCache,
  getCacheStatus,
} from "@/lib/newsCache";

interface NewsItem {
  title: string;
  summary: string;
  source?: string;
  url?: string;
}

// Función para detectar la región (reutilizada del endpoint principal)
function detectRegion(req: NextApiRequest): string {
  const countryHeader = req.headers["cf-ipcountry"] || req.headers["x-country"];
  const region = req.query.region as string;

  if (region) return region;

  switch (countryHeader) {
    case "AR":
      return "Argentina";
    case "CL":
      return "Chile";
    case "UY":
      return "Uruguay";
    case "MX":
      return "México";
    case "CO":
      return "Colombia";
    default:
      return "Argentina";
  }
}

// Función para obtener noticias frescas de Perplexity
async function fetchFreshNews(region: string): Promise<NewsItem[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY not configured");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "Eres un analista experto en mercado inmobiliario. Siempre respondes en formato JSON válido. Proporciona información actualizada y precisa sobre el mercado inmobiliario.",
        },
        {
          role: "user",
          content: `Busca y proporciona las 3 noticias más importantes y recientes del mercado inmobiliario en ${region} de esta semana. 

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido en este formato exacto:

{
  "news": [
    {
      "title": "Título conciso (máximo 80 caracteres)",
      "summary": "Resumen detallado de 2-3 párrafos explicando la noticia, su impacto en el mercado inmobiliario y las implicaciones para compradores, vendedores o inversores.",
      "source": "Nombre de la fuente de la noticia",
      "url": "URL completa del artículo original"
    }
  ]
}

Asegúrate de que:
- Los títulos sean informativos y concisos
- Los resúmenes expliquen claramente el impacto en el mercado inmobiliario
- Las noticias sean recientes (últimos 7 días si es posible)
- INCLUYE la URL completa y válida de cada artículo para que los usuarios puedan leer la noticia completa
- El JSON sea válido y parseable
- Todas las URLs sean accesibles y provengan de sitios web reales de noticias`,
        },
      ],
      max_tokens: 2500,
      temperature: 0.1,
      top_p: 0.9,
      return_citations: true,
      search_recency_filter: "week",
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Perplexity API error: ${response.status} - ${errorText}`);
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content received from Perplexity API");
  }

  // Parsear el JSON
  let newsData;
  try {
    newsData = JSON.parse(content);
  } catch (firstParseError) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        newsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (secondParseError) {
      console.error(
        "Failed to parse JSON from Perplexity response:",
        secondParseError
      );
      newsData = {
        news: [
          {
            title: `Análisis de Mercado Inmobiliario - ${region}`,
            summary: `Resumen del mercado inmobiliario actual:\n\n${content.substring(0, 300)}...\n\nEsta información se basa en el análisis más reciente del mercado inmobiliario en ${region}.`,
            source: "Análisis de Mercado",
            url: "https://example.com/market-analysis",
          },
        ],
      };
    }
  }

  // Validar y limpiar los datos
  const news = (newsData.news || []).slice(0, 3).map((item: any) => ({
    title: String(item.title || "Sin título").substring(0, 100),
    summary: String(item.summary || "Sin resumen disponible"),
    source: String(item.source || "Fuente no especificada"),
    url: String(item.url || "Sin URL disponible"),
  }));

  return news;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitir GET y POST para flexibilidad
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = req.headers["x-api-key"];
  if (!process.env.CRON_API_KEY) {
    console.error("[CRON] CRON_API_KEY no está configurado");
    return res.status(500).json({
      error: "Server configuration error",
      hint: "CRON_API_KEY environment variable is not set",
    });
  }

  if (apiKey !== process.env.CRON_API_KEY) {
    return res.status(401).json({
      error: "Unauthorized",
      hint: "Add CRON_API_KEY header to your request",
    });
  }

  try {
    const region = detectRegion(req);
    const forceUpdate = req.query.force === "true";

    const cacheStatus = getCacheStatus(region);

    const needsUpdate = forceUpdate || shouldUpdateCache(region);

    if (!needsUpdate) {
      const cached = getCachedNews(region);
      return res.status(200).json({
        message: "Cache is up to date, no update needed",
        cacheStatus,
        news: cached?.news || [],
      });
    }

    if (!cacheStatus.isUpdateTime && !forceUpdate) {
      return res.status(200).json({
        message: "Outside update hours (7am-10pm)",
        cacheStatus,
        news: getCachedNews(region)?.news || [],
      });
    }

    const freshNews = await fetchFreshNews(region);

    setCachedNews(freshNews, region);

    res.status(200).json({
      message: "News cache updated successfully",
      region,
      updatedAt: new Date().toISOString(),
      newsCount: freshNews.length,
      news: freshNews,
    });
  } catch (error) {
    console.error("[CRON] Error updating news cache:", error);

    // En caso de error, devolver caché existente si está disponible
    const region = detectRegion(req);
    const cached = getCachedNews(region);

    res.status(500).json({
      error: "Failed to update news cache",
      message: error instanceof Error ? error.message : "Unknown error",
      fallbackNews: cached?.news || [],
    });
  }
}
