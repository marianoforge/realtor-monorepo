import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import { ApiResponder } from "@/lib/schemas";
import { EVENT_TYPE_TO_WAR_COLUMN, WARColumn } from "@gds-si/shared-utils";

/**
 * Tipo para los conteos de eventos por semana
 */
export interface WeekEventCounts {
  semana: number;
  actividadVerde: number;
  contactosReferidos: number;
  preBuying: number;
  preListing: number;
  captaciones: number;
  reservas: number;
  cierres: number;
  postVenta: number;
}

/**
 * Obtiene el número de semana ISO 8601 para una fecha dada
 */
const getISOWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/**
 * API endpoint para obtener conteos de eventos pasados por semana y categoría WAR
 * GET /api/events/counts-by-week?userId=xxx&year=2025
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "GET") {
    return respond.methodNotAllowed();
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const authenticatedUserId = decodedToken.uid;

    // Obtener parámetros
    const { userId, year } = req.query;
    const targetUserId = (userId as string) || authenticatedUserId;
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    // Verificar que el usuario autenticado puede acceder a estos datos
    // (puede ser el mismo usuario o un team leader viendo a su asesor)
    if (targetUserId !== authenticatedUserId) {
      // Aquí podrías agregar lógica para verificar si es team leader
      // Por ahora permitimos solo al propio usuario
      // TODO: Agregar verificación de team leader si es necesario
    }

    // Fecha de hoy (para filtrar solo eventos pasados)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Incluir eventos de hoy

    // Consultar todos los eventos del usuario del año especificado
    const startOfYear = `${targetYear}-01-01`;
    const endOfYear = `${targetYear}-12-31`;

    const eventsSnapshot = await db
      .collection("events")
      .where("user_uid", "==", targetUserId)
      .where("date", ">=", startOfYear)
      .where("date", "<=", endOfYear)
      .get();

    // Inicializar conteos para las 52 semanas
    const weekCounts: Map<number, WeekEventCounts> = new Map();
    for (let i = 1; i <= 52; i++) {
      weekCounts.set(i, {
        semana: i,
        actividadVerde: 0,
        contactosReferidos: 0,
        preBuying: 0,
        preListing: 0,
        captaciones: 0,
        reservas: 0,
        cierres: 0,
        postVenta: 0,
      });
    }

    // Procesar cada evento
    eventsSnapshot.docs.forEach((doc) => {
      const event = doc.data();
      const eventDate = new Date(event.date);

      // Solo contar eventos que:
      // 1. Ya pasaron (fecha <= hoy)
      // 2. Tienen eventType definido
      // 3. Están marcados como completados (completed === true)
      if (eventDate <= today && event.eventType && event.completed === true) {
        const weekNumber = getISOWeekNumber(eventDate);
        const warColumn = EVENT_TYPE_TO_WAR_COLUMN[
          event.eventType
        ] as WARColumn;

        if (warColumn && weekNumber >= 1 && weekNumber <= 52) {
          const weekData = weekCounts.get(weekNumber);
          if (weekData) {
            weekData[warColumn]++;
          }
        }
      }
    });

    // Convertir Map a array y filtrar semanas sin eventos
    const result = Array.from(weekCounts.values());

    return respond.success(result);
  } catch (error) {
    console.error("Error en /api/events/counts-by-week:", error);
    return respond.internalError("Error al obtener conteos de eventos");
  }
}
