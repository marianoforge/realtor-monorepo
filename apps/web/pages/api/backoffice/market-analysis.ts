import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

// Tasas de cambio por defecto (fallback si falla la API) - Diciembre 2024
const DEFAULT_EXCHANGE_RATES: { [key: string]: number } = {
  USD: 1, // Base currency
  ARS: 1010, // 1 USD = 1010 ARS (diciembre 2024)
  EUR: 0.92, // 1 USD = 0.92 EUR
  BRL: 6.1, // 1 USD = 6.10 BRL
  CLP: 980, // 1 USD = 980 CLP
  COP: 4380, // 1 USD = 4380 COP
  MXN: 20.15, // 1 USD = 20.15 MXN
  CAD: 1.43, // 1 USD = 1.43 CAD
  UYU: 43.5, // 1 USD = 43.50 UYU
  PEN: 3.75, // 1 USD = 3.75 PEN
  BOB: 6.91, // 1 USD = 6.91 BOB (Bolivianos)
  ECU: 1, // Ecuador usa USD
  PYG: 7450, // 1 USD = 7450 PYG (Guaraníes paraguayos)
};

// Función para obtener tasas de cambio actuales usando Perplexity
const fetchCurrentExchangeRates = async (
  currencies: string[]
): Promise<{ [key: string]: number } | null> => {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const currencyList = currencies.filter((c) => c !== "USD").join(", ");

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
              "Eres un experto en finanzas y tasas de cambio. Siempre respondes en formato JSON válido con las tasas de cambio más actuales.",
          },
          {
            role: "user",
            content: `Proporciona las tasas de cambio oficiales actuales del día de hoy para las siguientes monedas latinoamericanas contra el USD: ${currencyList}. 

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido en este formato exacto:

{
  "exchangeRates": {
    "USD": 1,
    "ARS": 1015.75,
    "EUR": 0.92,
    "BRL": 6.08,
    "CLP": 975.30,
    "COP": 4385.50,
    "MXN": 20.12,
    "CAD": 1.43,
    "UYU": 43.25,
    "PEN": 3.74,
    "PYG": 7450,
    "BOB": 6.91
  },
  "lastUpdated": "2024-12-19",
  "source": "Bancos centrales y fuentes financieras oficiales"
}

INSTRUCCIONES CRÍTICAS:
- Usa tasas de cambio OFICIALES de bancos centrales
- Para ARS (peso argentino): debe estar entre 1000-1050 actualmente
- Para CLP (peso chileno): debe estar entre 950-1000 actualmente  
- Para COP (peso colombiano): debe estar entre 4300-4500 actualmente
- Para BRL (real brasileño): debe estar entre 6.0-6.2 actualmente
- Para PYG (guaraní paraguayo): debe estar entre 7400-7500 actualmente
- USD siempre sea 1 (moneda base)
- Solo incluyas las monedas solicitadas: ${currencyList}
- El JSON debe ser válido y parseable
- Las tasas deben reflejar el valor ACTUAL del mercado interbancario`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.1,
        top_p: 0.9,
        return_citations: true,
        search_recency_filter: "day",
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return null;
    }

    let exchangeData;
    try {
      exchangeData = JSON.parse(content);
    } catch (firstParseError) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          exchangeData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (secondParseError) {
        console.error(
          "Failed to parse JSON from Perplexity response:",
          secondParseError
        );
        return null;
      }
    }

    const rates = { ...DEFAULT_EXCHANGE_RATES };
    if (exchangeData.exchangeRates) {
      Object.keys(exchangeData.exchangeRates).forEach((currency) => {
        const rate = Number(exchangeData.exchangeRates[currency]);
        if (!isNaN(rate) && rate > 0) {
          rates[currency] = rate;
        }
      });
    }

    return rates;
  } catch (error) {
    console.error("Error obteniendo tasas de cambio:", error);
    return null;
  }
};

const convertToUSD = (
  amount: number,
  currency: string,
  exchangeRates: { [key: string]: number }
): number => {
  if (!currency || currency === "USD") return amount;

  const rate = exchangeRates[currency];
  if (!rate) {
    return amount;
  }

  return amount / rate;
};

const getUserCurrency = async (userId: string): Promise<string> => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();
    return userData?.currency || "USD";
  } catch (error) {
    return "USD";
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Obtener todas las operaciones y usuarios
    const [operationsSnapshot, usersSnapshot] = await Promise.all([
      db.collection("operations").get(),
      db.collection("users").get(),
    ]);

    const operations = operationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Crear mapa de usuarios para obtener monedas rápidamente
    const userCurrencyMap: { [userId: string]: string } = {};
    const uniqueCurrencies = new Set<string>();

    users.forEach((user) => {
      if (user.uid) {
        const currency = user.currency || "USD";
        userCurrencyMap[user.uid] = currency;
        uniqueCurrencies.add(currency);
      }
    });

    // Verificar si se necesitan conversiones de moneda
    const needsCurrencyConversion = Array.from(uniqueCurrencies).some(
      (currency) => currency !== "USD"
    );

    let exchangeRates: { [key: string]: number };

    if (needsCurrencyConversion) {
      // Obtener tasas de cambio actuales solo si se necesitan
      const fetchedRates = await fetchCurrentExchangeRates(
        Array.from(uniqueCurrencies)
      );

      if (!fetchedRates) {
        console.error("No se pudieron obtener tasas de cambio confiables");
        return res.status(503).json({
          success: false,
          error: "exchange_rates_unavailable",
          message:
            "No se pudieron obtener tasas de cambio actualizadas desde fuentes oficiales.",
          suggestion:
            "Intente nuevamente en unos minutos. El análisis requiere tasas de cambio actuales para conversiones precisas.",
          currenciesFound: Array.from(uniqueCurrencies),
          note: "No se muestran datos con tasas desactualizadas para evitar análisis incorrectos.",
        });
      }
      exchangeRates = fetchedRates;
    } else {
      exchangeRates = { USD: 1 };
    }

    // Convertir todos los valores a USD
    const operationsInUSD = operations.map((op) => {
      const userCurrency = userCurrencyMap[op.user_uid] || "USD";
      const valorReservaUSD = convertToUSD(
        Number(op.valor_reserva || 0),
        userCurrency,
        exchangeRates
      );
      const honorariosBrokerUSD = convertToUSD(
        Number(op.honorarios_broker || 0),
        userCurrency,
        exchangeRates
      );

      return {
        ...op,
        valor_reserva_original: op.valor_reserva,
        valor_reserva: valorReservaUSD,
        honorarios_broker_original: op.honorarios_broker,
        honorarios_broker: honorariosBrokerUSD,
        user_currency: userCurrency,
        valor_reserva_usd: valorReservaUSD, // Para tracking
      };
    });

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Filtrar operaciones cerradas con valores válidos
    const validOperations = operationsInUSD.filter(
      (op) =>
        op.estado === "Cerrada" && op.valor_reserva > 0 && op.fecha_operacion
    );

    // Operaciones del año actual y anterior
    const currentYearOps = validOperations.filter((op) => {
      const year = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      ).getFullYear();
      return year === currentYear;
    });

    const previousYearOps = validOperations.filter((op) => {
      const year = new Date(
        op.fecha_operacion || op.fecha_reserva || ""
      ).getFullYear();
      return year === previousYear;
    });

    // 1. ANÁLISIS DE RESUMEN GENERAL
    const summary = {
      totalOperationsThisYear: currentYearOps.length,
      totalOperationsLastYear: previousYearOps.length,
      totalVolumeThisYear: currentYearOps.reduce(
        (sum, op) => sum + op.valor_reserva,
        0
      ),
      totalVolumeLastYear: previousYearOps.reduce(
        (sum, op) => sum + op.valor_reserva,
        0
      ),
      avgPriceThisYear:
        currentYearOps.length > 0
          ? currentYearOps.reduce((sum, op) => sum + op.valor_reserva, 0) /
            currentYearOps.length
          : 0,
      avgPriceLastYear:
        previousYearOps.length > 0
          ? previousYearOps.reduce((sum, op) => sum + op.valor_reserva, 0) /
            previousYearOps.length
          : 0,
      currenciesProcessed: Object.keys(userCurrencyMap).length,
      conversionsApplied: operationsInUSD.filter(
        (op) => op.user_currency !== "USD"
      ).length,
      yearOverYearGrowth: 0,
      priceGrowth: 0,
    };

    // Calcular crecimientos
    summary.yearOverYearGrowth =
      summary.totalOperationsLastYear > 0
        ? ((summary.totalOperationsThisYear - summary.totalOperationsLastYear) /
            summary.totalOperationsLastYear) *
          100
        : 0;

    summary.priceGrowth =
      summary.avgPriceLastYear > 0
        ? ((summary.avgPriceThisYear - summary.avgPriceLastYear) /
            summary.avgPriceLastYear) *
          100
        : 0;

    // 2. ANÁLISIS POR TIPO DE PROPIEDAD
    const propertyTypeAnalysis: any = {};
    currentYearOps.forEach((op) => {
      const type = op.tipo_operacion || "Sin especificar";
      if (!propertyTypeAnalysis[type]) {
        propertyTypeAnalysis[type] = {
          count: 0,
          totalValue: 0,
          avgValue: 0,
          totalFees: 0,
        };
      }

      propertyTypeAnalysis[type].count++;
      propertyTypeAnalysis[type].totalValue += op.valor_reserva;
      propertyTypeAnalysis[type].totalFees += op.honorarios_broker;
    });

    // Calcular promedios
    Object.keys(propertyTypeAnalysis).forEach((type) => {
      const data = propertyTypeAnalysis[type];
      data.avgValue = data.count > 0 ? data.totalValue / data.count : 0;
    });

    const topPropertyTypes = Object.entries(propertyTypeAnalysis)
      .map(([type, data]: [string, any]) => ({
        type,
        ...data,
        marketShare: (data.count / currentYearOps.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    // 3. ANÁLISIS POR LOCALIDAD
    const locationAnalysis: any = {};
    currentYearOps.forEach((op) => {
      const location = op.localidad_reserva || "Sin especificar";
      if (!locationAnalysis[location]) {
        locationAnalysis[location] = {
          count: 0,
          totalValue: 0,
          avgValue: 0,
          maxValue: 0,
          minValue: Infinity,
        };
      }

      locationAnalysis[location].count++;
      locationAnalysis[location].totalValue += op.valor_reserva;
      locationAnalysis[location].maxValue = Math.max(
        locationAnalysis[location].maxValue,
        op.valor_reserva
      );
      locationAnalysis[location].minValue = Math.min(
        locationAnalysis[location].minValue,
        op.valor_reserva
      );
    });

    // Calcular promedios y limpiar valores infinitos
    Object.keys(locationAnalysis).forEach((location) => {
      const data = locationAnalysis[location];
      data.avgValue = data.count > 0 ? data.totalValue / data.count : 0;
      data.minValue = data.minValue === Infinity ? 0 : data.minValue;
    });

    const topLocations = Object.entries(locationAnalysis)
      .map(([location, data]: [string, any]) => ({
        location,
        ...data,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 15);

    // 4. ANÁLISIS MENSUAL (año actual)
    const monthlyAnalysis = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthOps = currentYearOps.filter((op) => {
        const opMonth =
          new Date(op.fecha_operacion || op.fecha_reserva || "").getMonth() + 1;
        return opMonth === month;
      });

      return {
        month,
        monthName: new Date(2024, i, 1).toLocaleString("es", { month: "long" }),
        count: monthOps.length,
        totalValue: monthOps.reduce((sum, op) => sum + op.valor_reserva, 0),
        avgValue:
          monthOps.length > 0
            ? monthOps.reduce((sum, op) => sum + op.valor_reserva, 0) /
              monthOps.length
            : 0,
        totalFees: monthOps.reduce((sum, op) => sum + op.honorarios_broker, 0),
      };
    });

    // 5. ANÁLISIS DE MONEDAS (actualizado con tasas reales)
    const currencyAnalysis: any = {};
    operationsInUSD.forEach((op) => {
      const currency = op.user_currency;
      if (!currencyAnalysis[currency]) {
        currencyAnalysis[currency] = {
          count: 0,
          totalValueOriginal: 0,
          totalValueUSD: 0,
          avgValueUSD: 0,
          exchangeRate: exchangeRates[currency] || 1,
          isLiveRate: exchangeRates !== DEFAULT_EXCHANGE_RATES,
        };
      }

      currencyAnalysis[currency].count++;
      currencyAnalysis[currency].totalValueOriginal += Number(
        op.valor_reserva_original || 0
      );
      currencyAnalysis[currency].totalValueUSD += op.valor_reserva;
    });

    // Calcular promedios para monedas
    Object.keys(currencyAnalysis).forEach((currency) => {
      const data = currencyAnalysis[currency];
      data.avgValueUSD = data.count > 0 ? data.totalValueUSD / data.count : 0;
    });

    const currencyBreakdown = Object.entries(currencyAnalysis)
      .map(([currency, data]: [string, any]) => ({
        currency,
        ...data,
        marketShare: (data.count / operationsInUSD.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    const result = {
      success: true,
      data: {
        summary: {
          ...summary,
          baseCurrency: "USD",
          note: "Todos los valores han sido convertidos a USD usando tasas de cambio actualizadas",
          ratesSource:
            exchangeRates === DEFAULT_EXCHANGE_RATES
              ? "Tasas por defecto"
              : "Perplexity API (tiempo real)",
        },
        propertyTypeAnalysis: topPropertyTypes,
        locationAnalysis: topLocations,
        monthlyTrends: monthlyAnalysis,
        currencyBreakdown,
        insights: {
          topPerformingLocation: topLocations[0],
          mostPopularPropertyType: topPropertyTypes[0],
          peakMonth: monthlyAnalysis.reduce(
            (max, month) => (month.totalValue > max.totalValue ? month : max),
            monthlyAnalysis[0]
          ),
          dominantCurrency: currencyBreakdown[0],
          priceVolatility:
            topLocations.length > 0
              ? ((Math.max(...topLocations.map((l) => l.avgValue)) -
                  Math.min(...topLocations.map((l) => l.avgValue))) /
                  (topLocations.reduce((sum, l) => sum + l.avgValue, 0) /
                    topLocations.length)) *
                100
              : 0,
        },
        metadata: {
          totalOperationsAnalyzed: validOperations.length,
          currenciesProcessed: Object.keys(currencyAnalysis).length,
          exchangeRatesUsed: exchangeRates,
          exchangeRatesSource: needsCurrencyConversion
            ? "Live rates via Perplexity"
            : "No conversion needed (USD only)",
          generatedAt: new Date().toISOString(),
          dataRange: `${previousYear}-${currentYear}`,
          uniqueCurrenciesFound: Array.from(uniqueCurrencies),
          conversionRequired: needsCurrencyConversion,
        },
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en análisis de mercado:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

export default withBackofficeAuth(handler);
