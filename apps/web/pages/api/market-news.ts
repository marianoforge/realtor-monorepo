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

interface MarketNewsResponse {
  news: NewsItem[];
  error?: string;
  cacheInfo?: {
    lastUpdated?: string;
    nextUpdate?: string;
    source: "cache" | "fresh" | "fallback";
  };
}

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

function repairJson(str: string): string {
  let cleaned = str
    .replace(/^\uFEFF/, "") // BOM
    .replace(/^[\u200B-\u200D\uFEFF]/g, "") // Zero-width spaces
    .replace(/[""]/g, '"') // Comillas tipográficas
    .replace(/['']/g, "'")
    .trim();

  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const prevChar = i > 0 ? cleaned[i - 1] : "";

    if (char === '"' && prevChar !== "\\") {
      inString = !inString;
    }

    if (!inString) {
      if (char === "{") openBraces++;
      if (char === "}") openBraces--;
      if (char === "[") openBrackets++;
      if (char === "]") openBrackets--;
    }
  }

  if (openBraces > 0 || openBrackets > 0) {
    if (inString) {
      cleaned += '"';
    }

    for (let i = 0; i < openBrackets; i++) {
      cleaned += "]";
    }
    for (let i = 0; i < openBraces; i++) {
      cleaned += "}";
    }
  }

  return cleaned;
}

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

  let newsData;
  let parseSuccessful = false;

  try {
    const repairedContent = repairJson(content);
    newsData = JSON.parse(repairedContent);
    parseSuccessful = true;
  } catch (firstParseError) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const repairedMatch = repairJson(jsonMatch[0]);
        newsData = JSON.parse(repairedMatch);
        parseSuccessful = true;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (secondParseError) {
      console.error("Failed to parse JSON from Perplexity response:", {
        firstError: firstParseError,
        secondError: secondParseError,
      });
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
  res: NextApiResponse<MarketNewsResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ news: [], error: "Method not allowed" });
  }

  try {
    const region = detectRegion(req);
    const forceRefresh = req.query.force === "true";

    const cachedNews = getCachedNews(region);
    const cacheStatus = getCacheStatus(region);

    if (cachedNews && !forceRefresh && !shouldUpdateCache(region)) {
      return res.status(200).json({
        news: cachedNews.news,
        cacheInfo: {
          lastUpdated: cachedNews.lastUpdated,
          nextUpdate: cachedNews.nextUpdate,
          source: "cache",
        },
      });
    }

    if (
      (shouldUpdateCache(region) && cacheStatus.isUpdateTime) ||
      forceRefresh
    ) {
      try {
        const freshNews = await fetchFreshNews(region);
        setCachedNews(freshNews, region);

        return res.status(200).json({
          news: freshNews,
          cacheInfo: {
            lastUpdated: new Date().toISOString(),
            nextUpdate: cacheStatus.nextUpdate || undefined,
            source: "fresh",
          },
        });
      } catch (error) {
        console.error(
          "Error fetching fresh news, falling back to cache:",
          error
        );

        if (cachedNews) {
          return res.status(200).json({
            news: cachedNews.news,
            cacheInfo: {
              lastUpdated: cachedNews.lastUpdated,
              nextUpdate: cachedNews.nextUpdate,
              source: "cache",
            },
            error: "Error al actualizar noticias, mostrando versión en caché",
          });
        }
      }
    }

    if (cachedNews) {
      return res.status(200).json({
        news: cachedNews.news,
        cacheInfo: {
          lastUpdated: cachedNews.lastUpdated,
          nextUpdate: cachedNews.nextUpdate,
          source: "cache",
        },
      });
    }
    const fallbackNews = [
      {
        title: "Mercado Inmobiliario en Análisis",
        summary:
          "El mercado inmobiliario continúa experimentando cambios significativos. Los analistas recomiendan mantenerse informado sobre las últimas tendencias y regulaciones que puedan afectar las decisiones de inversión.\n\nEs importante consultar fuentes actualizadas y considerar las condiciones económicas locales al tomar decisiones inmobiliarias.",
        source: "Análisis General",
        url: "https://www.realestate.com/market-analysis",
      },
    ];

    res.status(200).json({
      news: fallbackNews,
      cacheInfo: {
        source: "fallback",
      },
    });
  } catch (error) {
    console.error("Error in market-news API:", error);

    // Intentar servir caché existente en caso de error
    const region = detectRegion(req);
    const cachedNews = getCachedNews(region);

    if (cachedNews) {
      return res.status(200).json({
        news: cachedNews.news,
        cacheInfo: {
          lastUpdated: cachedNews.lastUpdated,
          nextUpdate: cachedNews.nextUpdate,
          source: "cache",
        },
        error: "Error en el servicio, mostrando noticias en caché",
      });
    }

    // Último recurso si no hay caché
    const fallbackNews = [
      {
        title: "Mercado Inmobiliario en Análisis",
        summary:
          "El mercado inmobiliario continúa experimentando cambios significativos. Los analistas recomiendan mantenerse informado sobre las últimas tendencias y regulaciones que puedan afectar las decisiones de inversión.",
        source: "Análisis General",
        url: "https://www.realestate.com/market-analysis",
      },
    ];

    res.status(500).json({
      news: fallbackNews,
      error: "Error al obtener las noticias del mercado inmobiliario",
      cacheInfo: {
        source: "fallback",
      },
    });
  }
}
