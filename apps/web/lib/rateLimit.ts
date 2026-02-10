import { NextApiRequest, NextApiResponse } from "next";

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  rateLimitStore.forEach((entry, key) => {
    if (now - entry.firstRequest > windowMs) {
      rateLimitStore.delete(key);
    }
  });
}

function getClientIdentifier(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0].trim()
      : req.socket?.remoteAddress || "unknown";

  return ip;
}

export interface RateLimitConfig {
  /** Número máximo de requests permitidos en la ventana de tiempo */
  maxRequests: number;
  /** Ventana de tiempo en milisegundos */
  windowMs: number;
  /** Mensaje de error personalizado */
  message?: string;
  /** Prefijo para el identificador (para separar diferentes endpoints) */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(
  req: NextApiRequest,
  config: RateLimitConfig
): RateLimitResult {
  const { maxRequests, windowMs, keyPrefix = "" } = config;
  const clientId = getClientIdentifier(req);
  const key = `${keyPrefix}:${clientId}`;
  const now = Date.now();

  cleanupExpiredEntries(windowMs);

  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstRequest > windowMs) {
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.firstRequest + windowMs,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.firstRequest + windowMs,
  };
}

export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
): boolean {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  const result = checkRateLimit(req, config);

  res.setHeader("X-RateLimit-Limit", config.maxRequests);
  res.setHeader("X-RateLimit-Remaining", result.remaining);
  res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000));

  if (!result.success) {
    const message =
      config.message || "Demasiados intentos. Por favor, esperá unos minutos.";

    res.status(429).json({
      message,
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    });
    return false;
  }

  return true;
}

export const RATE_LIMIT_CONFIGS = {
  login: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: "Demasiados intentos de login. Por favor, esperá 1 minuto.",
    keyPrefix: "login",
  } as RateLimitConfig,

  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: "Demasiados intentos de registro. Por favor, esperá 1 hora.",
    keyPrefix: "register",
  } as RateLimitConfig,

  chatbot: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    message:
      "Estás enviando mensajes muy rápido. Por favor, esperá un momento.",
    keyPrefix: "chatbot",
  } as RateLimitConfig,

  resetPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message:
      "Demasiados intentos de recuperación de contraseña. Por favor, esperá 1 hora.",
    keyPrefix: "reset-password",
  } as RateLimitConfig,

  general: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: "Demasiadas solicitudes. Por favor, esperá un momento.",
    keyPrefix: "general",
  } as RateLimitConfig,
};
