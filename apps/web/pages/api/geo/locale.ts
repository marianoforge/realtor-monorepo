import type { NextApiRequest, NextApiResponse } from "next";

type SupportedLocale = "es-AR" | "es-CL" | "es-CO" | "es-UY" | "es-PY";

const COUNTRY_TO_LOCALE: Record<string, SupportedLocale> = {
  AR: "es-AR",
  CL: "es-CL",
  CO: "es-CO",
  UY: "es-UY",
  PY: "es-PY",
};

const DEFAULT_LOCALE: SupportedLocale = "es-AR";

function getLocaleFromRequest(req: NextApiRequest): SupportedLocale {
  const header =
    (req.headers["x-vercel-ip-country"] as string) ||
    (req.headers["cf-ipcountry"] as string) ||
    (req.headers["x-country"] as string);
  if (!header || typeof header !== "string") return DEFAULT_LOCALE;
  const code = header.trim().toUpperCase();
  const locale = COUNTRY_TO_LOCALE[code];
  if (locale) return locale;
  return DEFAULT_LOCALE;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const locale = getLocaleFromRequest(req);
  return res.status(200).json({ locale });
}
