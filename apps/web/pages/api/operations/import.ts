import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { adminAuth } from "@/lib/firebaseAdmin";
import formidable from "formidable";
import fs from "fs";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const db = getFirestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

// 🔒 CONSTANTES DE SEGURIDAD
const MAX_ROWS_PER_IMPORT = 1000; // Máximo de filas por importación
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_STRING_LENGTH = 1000; // Longitud máxima de strings
const MAX_IMPORTS_PER_HOUR = 10; // Máximo de importaciones por hora por usuario

// 🔒 Función para sanitizar strings (prevenir XSS y código malicioso)
function sanitizeString(
  value: string | undefined,
  maxLength: number = MAX_STRING_LENGTH
): string {
  if (!value) return "";

  // Limpiar el string
  let cleaned = String(value)
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remover scripts
    .replace(/<[^>]+>/g, "") // Remover HTML tags
    .replace(/javascript:/gi, "") // Remover javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remover event handlers
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

  // Limitar longitud
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}

// 🔒 Función para validar email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 255;
}

// 🔒 Función para validar valores numéricos (prevenir valores extremos)
function validateNumericValue(
  value: number,
  fieldName: string
): { valid: boolean; error?: string } {
  // Valores máximos razonables
  const MAX_VALUES: Record<string, number> = {
    valor_reserva: 1000000000000, // 1 billón
    porcentaje_punta_compradora: 100,
    porcentaje_punta_vendedora: 100,
    porcentaje_honorarios_broker: 100,
    porcentaje_honorarios_asesor: 100,
    porcentaje_honorarios_asesor_adicional: 100,
    porcentaje_compartido: 100,
    porcentaje_referido: 100,
    monto_sobre_reserva: 1000000000, // 1 mil millones
    monto_sobre_refuerzo: 1000000000,
    gastos_operacion: 1000000000,
  };

  if (value < 0) {
    return { valid: false, error: `${fieldName} no puede ser negativo` };
  }

  const maxValue = MAX_VALUES[fieldName];
  if (maxValue && value > maxValue) {
    return {
      valid: false,
      error: `${fieldName} excede el valor máximo permitido (${maxValue})`,
    };
  }

  if (!isFinite(value) || isNaN(value)) {
    return { valid: false, error: `${fieldName} debe ser un número válido` };
  }

  return { valid: true };
}

interface OperationRow {
  fecha_reserva?: string;
  direccion_reserva?: string;
  tipo_operacion?: string;
  valor_reserva?: string;
  estado?: string;
  porcentaje_punta_compradora?: string;
  porcentaje_punta_vendedora?: string;
  punta_compradora?: string;
  punta_vendedora?: string;
  tipo_inmueble?: string;
  fecha_operacion?: string;
  fecha_captacion?: string;
  numero_casa?: string;
  localidad_reserva?: string;
  provincia_reserva?: string;
  porcentaje_honorarios_broker?: string;
  exclusiva?: string;
  no_exclusiva?: string;
  numero_sobre_reserva?: string;
  numero_sobre_refuerzo?: string;
  monto_sobre_reserva?: string;
  monto_sobre_refuerzo?: string;
  referido?: string;
  compartido?: string;
  porcentaje_compartido?: string;
  porcentaje_referido?: string;
  realizador_venta?: string;
  porcentaje_honorarios_asesor?: string;
  realizador_venta_adicional?: string;
  porcentaje_honorarios_asesor_adicional?: string;
  observaciones?: string;
  pais?: string;
  gastos_operacion?: string;
  captacion_no_es_mia?: string;
}

interface ImportError {
  row: number;
  error: string;
}

const validOperationTypes = [
  "Venta",
  "Compra",
  "Alquiler Temporal",
  "Alquiler Tradicional",
  "Alquiler Comercial",
  "Fondo de Comercio",
  "Desarrollo Inmobiliario",
  "Cochera",
  "Loteamiento",
  "Lotes Para Desarrollos",
];

// 🔄 Mapeo de headers amigables (labels del formulario) a nombres de variables
const HEADER_LABEL_MAP: Record<string, string> = {
  // Labels amigables de la nueva plantilla -> nombres de variables
  fecha_de_reserva: "fecha_reserva",
  "fecha_de_reserva*": "fecha_reserva",
  "fecha_reserva*": "fecha_reserva",
  fecha_de_captacion: "fecha_captacion",
  "fecha_de_captacion_/_publicacion": "fecha_captacion",
  "fecha_captacion_/_publicacion": "fecha_captacion",
  fecha_de_cierre: "fecha_operacion",
  tipo_de_operacion: "tipo_operacion",
  "tipo_de_operacion*": "tipo_operacion",
  "tipo_operacion*": "tipo_operacion",
  tipo_de_inmueble: "tipo_inmueble",
  direccion: "direccion_reserva",
  "direccion*": "direccion_reserva",
  direccion_de_la_operacion: "direccion_reserva",
  "direccion_reserva*": "direccion_reserva",
  valor_de_reserva: "valor_reserva",
  "valor_de_reserva*": "valor_reserva",
  valor_de_la_reserva: "valor_reserva",
  "valor_reserva*": "valor_reserva",
  "estado*": "estado",
  // Porcentajes punta compradora/vendedora
  porcentaje_punta_compradora: "porcentaje_punta_compradora",
  "%_punta_compradora": "porcentaje_punta_compradora",
  porcentaje_punta_vendedora: "porcentaje_punta_vendedora",
  "porcentaje_punta_vendedora*": "porcentaje_punta_vendedora",
  "%_punta_vendedora": "porcentaje_punta_vendedora",
  "%_punta_vendedora*": "porcentaje_punta_vendedora",
  // Ubicación
  localidad: "localidad_reserva",
  provincia: "provincia_reserva",
  pais: "pais",
  numero_de_casa: "numero_casa",
  nro_casa: "numero_casa",
  // Honorarios broker
  porcentaje_honorarios_broker: "porcentaje_honorarios_broker",
  "%_honorarios_broker": "porcentaje_honorarios_broker",
  // Sobres
  numero_sobre_reserva: "numero_sobre_reserva",
  nro_sobre_reserva: "numero_sobre_reserva",
  numero_sobre_refuerzo: "numero_sobre_refuerzo",
  nro_sobre_refuerzo: "numero_sobre_refuerzo",
  monto_sobre_reserva: "monto_sobre_reserva",
  monto_sobre_refuerzo: "monto_sobre_refuerzo",
  // Compartido/Referido
  porcentaje_compartido: "porcentaje_compartido",
  "%_compartido": "porcentaje_compartido",
  porcentaje_referido: "porcentaje_referido",
  "%_referido": "porcentaje_referido",
  // Asesores
  asesor: "realizador_venta",
  "asesor_(email)": "realizador_venta",
  email_asesor: "realizador_venta",
  realizador_de_venta: "realizador_venta",
  porcentaje_honorarios_asesor: "porcentaje_honorarios_asesor",
  "%_honorarios_asesor": "porcentaje_honorarios_asesor",
  asesor_adicional: "realizador_venta_adicional",
  "asesor_adicional_(email)": "realizador_venta_adicional",
  email_asesor_adicional: "realizador_venta_adicional",
  realizador_de_venta_adicional: "realizador_venta_adicional",
  porcentaje_honorarios_asesor_adicional:
    "porcentaje_honorarios_asesor_adicional",
  "%_honorarios_asesor_adicional": "porcentaje_honorarios_asesor_adicional",
  // Otros
  notas: "observaciones",
  gastos_de_operacion: "gastos_operacion",
  captacion_no_es_mia: "captacion_no_es_mia",
  la_captacion_no_es_mia: "captacion_no_es_mia",
  // Booleanos
  no_exclusiva: "no_exclusiva",
};

// Función para normalizar headers (convierte label amigable a nombre de variable)
function normalizeHeader(header: string): string {
  const normalized = header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // espacios a guiones bajos
    .replace(/[áàäâ]/g, "a")
    .replace(/[éèëê]/g, "e")
    .replace(/[íìïî]/g, "i")
    .replace(/[óòöô]/g, "o")
    .replace(/[úùüû]/g, "u")
    .replace(/ñ/g, "n");

  // Si existe en el mapa de labels, devolver el nombre de variable correspondiente
  if (HEADER_LABEL_MAP[normalized]) {
    return HEADER_LABEL_MAP[normalized];
  }

  // Remover asterisco al final si lo tiene y buscar de nuevo
  const withoutAsterisk = normalized.replace(/\*$/, "");
  if (HEADER_LABEL_MAP[withoutAsterisk]) {
    return HEADER_LABEL_MAP[withoutAsterisk];
  }

  // Si no está en el mapa, devolver el header normalizado
  return withoutAsterisk;
}

const validStates = ["En Curso", "Cerrada", "Caída"];

const validPropertyTypes = [
  "Casa",
  "PH",
  "Departamentos",
  "Locales Comerciales",
  "Oficinas",
  "Naves Industriales",
  "Terrenos",
  "Chacras",
  "Otro",
];

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return (
    lower === "true" ||
    lower === "si" ||
    lower === "sí" ||
    lower === "1" ||
    lower === "yes"
  );
}

function parseNumber(value: string | undefined): number {
  if (!value || value.trim() === "") return 0;
  const parsed = parseFloat(value.replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

function parseDate(value: string | number | Date | undefined): string | null {
  if (!value) return null;

  // Si es un número (serial de Excel), convertir a fecha
  if (typeof value === "number") {
    // Excel cuenta días desde 1900-01-01, pero tiene un bug: cuenta 1900 como año bisiesto
    // Por eso usamos una fecha base de 1899-12-30
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  // Si es un objeto Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Si es string, procesar
  const strValue = String(value).trim();
  if (strValue === "") return null;

  // Intentar parsear como YYYY-MM-DD (formato ISO, sin ambigüedad)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoDateRegex.test(strValue)) {
    return strValue;
  }

  // Intentar parsear como DD-MM-YYYY o MM-DD-YYYY (con guiones o barras)
  const separator = strValue.includes("-")
    ? "-"
    : strValue.includes("/")
      ? "/"
      : null;
  if (separator) {
    const parts = strValue.split(separator);
    if (parts.length === 3) {
      const [part1, part2, part3] = parts.map((p) => parseInt(p.trim(), 10));

      // Validar que todos sean números válidos
      if (isNaN(part1) || isNaN(part2) || isNaN(part3)) {
        return null;
      }

      // Función auxiliar para convertir año de 2 dígitos a 4 dígitos
      const normalizeYear = (year: number): number => {
        if (year < 100) {
          // Si el año es de 2 dígitos, asumir 2000s
          // Ej: 24 -> 2024, 25 -> 2025, 99 -> 2099 (para fechas futuras), etc.
          // Si el año > 50, podría ser 1900s, pero para datos inmobiliarios asumimos 2000s
          return year < 50 ? 2000 + year : 1900 + year;
        }
        return year;
      };

      // Si el primer número es > 12, definitivamente es DD-MM-YYYY
      if (part1 > 12) {
        const year = normalizeYear(part3);
        return `${year}-${String(part2).padStart(2, "0")}-${String(part1).padStart(2, "0")}`;
      }

      // Si el segundo número es > 12, definitivamente es MM-DD-YYYY
      if (part2 > 12) {
        const year = normalizeYear(part3);
        return `${year}-${String(part1).padStart(2, "0")}-${String(part2).padStart(2, "0")}`;
      }

      // Ambos son <= 12: hay ambigüedad
      // Asumimos DD-MM-YYYY (formato argentino/europeo)
      // Ejemplo: 01-11-2025 se interpreta como día 1 del mes 11 = 1 de noviembre de 2025
      // NO como día 11 del mes 1 = 11 de enero (formato MM-DD-YYYY americano)
      // part1 = día, part2 = mes, part3 = año
      const year = normalizeYear(part3);
      return `${year}-${String(part2).padStart(2, "0")}-${String(part1).padStart(2, "0")}`;
    }
  }

  // Intentar parsear con Date nativo de JavaScript como último recurso
  // Nota: Date.parse puede ser ambiguo, así que preferimos nuestra lógica arriba
  const date = new Date(strValue);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
}

function validateRow(
  row: OperationRow,
  rowNumber: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Campos requeridos
  if (!row.fecha_reserva?.trim()) {
    errors.push("fecha_reserva es requerido");
  } else if (!parseDate(row.fecha_reserva)) {
    errors.push("fecha_reserva tiene formato inválido (usar YYYY-MM-DD)");
  }

  if (!row.direccion_reserva?.trim()) {
    errors.push("direccion_reserva es requerido");
  } else if (row.direccion_reserva.trim().length > 200) {
    errors.push("direccion_reserva excede la longitud máxima (200 caracteres)");
  }

  // 🔒 Validar longitudes de otros campos
  if (row.observaciones && row.observaciones.length > MAX_STRING_LENGTH) {
    errors.push(
      `observaciones excede la longitud máxima (${MAX_STRING_LENGTH} caracteres)`
    );
  }

  if (row.referido && row.referido.length > 100) {
    errors.push("referido excede la longitud máxima (100 caracteres)");
  }

  if (row.compartido && row.compartido.length > 100) {
    errors.push("compartido excede la longitud máxima (100 caracteres)");
  }

  if (!row.tipo_operacion?.trim()) {
    errors.push("tipo_operacion es requerido");
  } else if (!validOperationTypes.includes(row.tipo_operacion.trim())) {
    errors.push(`tipo_operacion inválido: ${row.tipo_operacion}`);
  }

  if (!row.valor_reserva?.trim()) {
    errors.push("valor_reserva es requerido");
  } else {
    const valorReserva = parseNumber(row.valor_reserva);
    const validation = validateNumericValue(valorReserva, "valor_reserva");
    if (!validation.valid) {
      errors.push(validation.error || "valor_reserva inválido");
    } else if (valorReserva <= 0) {
      errors.push("valor_reserva debe ser un número positivo");
    }
  }

  // 🔒 Validar emails si se proporcionan
  if (row.realizador_venta?.trim() && isEmail(row.realizador_venta.trim())) {
    if (!isValidEmail(row.realizador_venta.trim())) {
      errors.push("realizador_venta: email inválido");
    }
  }

  if (
    row.realizador_venta_adicional?.trim() &&
    isEmail(row.realizador_venta_adicional.trim())
  ) {
    if (!isValidEmail(row.realizador_venta_adicional.trim())) {
      errors.push("realizador_venta_adicional: email inválido");
    }
  }

  if (!row.estado?.trim()) {
    errors.push("estado es requerido");
  } else if (!validStates.includes(row.estado.trim())) {
    errors.push(`estado inválido: ${row.estado}`);
  }

  // porcentaje_punta_vendedora es requerido excepto para Compra
  if (row.tipo_operacion?.trim() !== "Compra") {
    if (!row.porcentaje_punta_vendedora?.trim()) {
      errors.push(
        "porcentaje_punta_vendedora es requerido (excepto para Compra)"
      );
    }
  }

  // Validar tipo_inmueble si está presente
  if (
    row.tipo_inmueble?.trim() &&
    !validPropertyTypes.includes(row.tipo_inmueble.trim())
  ) {
    errors.push(`tipo_inmueble inválido: ${row.tipo_inmueble}`);
  }

  return { valid: errors.length === 0, errors };
}

// Función auxiliar para verificar si un string es un email
function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}

// 🚀 Cache de miembros del equipo para evitar N+1 queries
interface TeamMemberCache {
  teamLeadID: string;
  members: Map<string, string>; // email -> uid
  isLoaded: boolean;
}

// 🚀 Pre-cargar todos los miembros del equipo UNA sola vez
async function loadTeamMembersCache(
  teamId: string,
  userUID: string
): Promise<TeamMemberCache> {
  const cache: TeamMemberCache = {
    teamLeadID: teamId,
    members: new Map(),
    isLoaded: false,
  };

  try {
    let teamLeadID: string = teamId;

    // Verificar si el teamId es realmente el teamLeadID
    const teamCheck = await db
      .collection("teams")
      .where("teamLeadID", "==", teamId)
      .limit(1)
      .get();

    if (teamCheck.empty) {
      const currentUserDoc = await db.collection("usuarios").doc(userUID).get();
      if (currentUserDoc.exists) {
        const userData = currentUserDoc.data();
        const userAsLeader = await db
          .collection("teams")
          .where("teamLeadID", "==", userUID)
          .limit(1)
          .get();
        if (!userAsLeader.empty) {
          teamLeadID = userUID;
        } else if (userData?.email) {
          const userAsMember = await db
            .collection("teams")
            .where("email", "==", userData.email)
            .limit(1)
            .get();
          if (!userAsMember.empty) {
            teamLeadID = userAsMember.docs[0].data().teamLeadID;
          }
        }
      }
    }

    cache.teamLeadID = teamLeadID;

    // Obtener el líder del equipo
    const leaderDoc = await db.collection("usuarios").doc(teamLeadID).get();
    if (leaderDoc.exists) {
      const leaderData = leaderDoc.data();
      if (leaderData?.email) {
        cache.members.set(leaderData.email.toLowerCase(), teamLeadID);
      }
    }

    // Obtener todos los miembros del equipo en UNA query
    const teamMembersSnapshot = await db
      .collection("teams")
      .where("teamLeadID", "==", teamLeadID)
      .get();

    // Recolectar todos los emails de miembros
    const memberEmails: string[] = [];
    for (const memberDoc of teamMembersSnapshot.docs) {
      const memberData = memberDoc.data();
      if (memberData.email) {
        memberEmails.push(memberData.email);
      }
    }

    // Obtener todos los usuarios por email en UNA query (si hay emails)
    if (memberEmails.length > 0) {
      // Firestore tiene límite de 30 elementos en "in" query, dividir si es necesario
      const BATCH_SIZE = 30;
      for (let i = 0; i < memberEmails.length; i += BATCH_SIZE) {
        const emailBatch = memberEmails.slice(i, i + BATCH_SIZE);
        const usersSnapshot = await db
          .collection("usuarios")
          .where("email", "in", emailBatch)
          .get();

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          if (userData?.email) {
            cache.members.set(userData.email.toLowerCase(), userDoc.id);
          }
        }
      }
    }

    cache.isLoaded = true;
  } catch (error) {
    console.error("Error cargando cache de miembros del equipo:", error);
  }

  return cache;
}

function findUserByEmailInCache(
  email: string,
  cache: TeamMemberCache
): string | null {
  if (!cache.isLoaded || !email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const uid = cache.members.get(normalizedEmail);

  if (!uid) {
    return null;
  }

  return uid;
}

// Función legacy para compatibilidad (usa cache si está disponible)
async function findUserByEmailInTeam(
  email: string,
  teamId: string,
  userUID: string,
  cache?: TeamMemberCache
): Promise<string | null> {
  // Si hay cache, usarlo (O(1) en lugar de múltiples queries)
  if (cache?.isLoaded) {
    return findUserByEmailInCache(email, cache);
  }

  // Fallback al método original (solo si no hay cache)
  try {
    let teamLeadID: string = teamId;
    const teamCheck = await db
      .collection("teams")
      .where("teamLeadID", "==", teamId)
      .limit(1)
      .get();

    if (teamCheck.empty) {
      const currentUserDoc = await db.collection("usuarios").doc(userUID).get();
      if (currentUserDoc.exists) {
        const userData = currentUserDoc.data();
        const userAsLeader = await db
          .collection("teams")
          .where("teamLeadID", "==", userUID)
          .limit(1)
          .get();
        if (!userAsLeader.empty) {
          teamLeadID = userUID;
        } else if (userData?.email) {
          const userAsMember = await db
            .collection("teams")
            .where("email", "==", userData.email)
            .limit(1)
            .get();
          if (!userAsMember.empty) {
            teamLeadID = userAsMember.docs[0].data().teamLeadID;
          }
        }
      }
    }

    const userQuery = db
      .collection("usuarios")
      .where("email", "==", email.trim());
    const userSnapshot = await userQuery.get();

    if (userSnapshot.empty) {
      return null;
    }

    const foundUID = userSnapshot.docs[0].id;
    const foundUserData = userSnapshot.docs[0].data();
    const foundUserEmail = foundUserData?.email;

    if (foundUID === teamLeadID) {
      return foundUID;
    }

    const teamMembersSnapshot = await db
      .collection("teams")
      .where("teamLeadID", "==", teamLeadID)
      .get();

    for (const memberDoc of teamMembersSnapshot.docs) {
      const memberData = memberDoc.data();
      if (memberData.email === foundUserEmail) {
        return foundUID;
      }
    }

    return null;
  } catch (error) {
    console.error(
      `Error buscando usuario por email ${email} en el equipo:`,
      error
    );
    return null;
  }
}

async function transformRow(
  row: OperationRow,
  teamId: string,
  userUID: string,
  cache?: TeamMemberCache
): Promise<Record<string, any>> {
  const now = new Date().toISOString();

  // 🔒 Sanitizar todos los campos de texto
  const sanitizedDireccion = sanitizeString(row.direccion_reserva, 200);
  const sanitizedObservaciones = sanitizeString(
    row.observaciones,
    MAX_STRING_LENGTH
  );
  const sanitizedReferido = sanitizeString(row.referido, 100);
  const sanitizedCompartido = sanitizeString(row.compartido, 100);
  const sanitizedNumeroCasa = sanitizeString(row.numero_casa, 50);
  const sanitizedLocalidad = sanitizeString(row.localidad_reserva, 100);
  const sanitizedProvincia = sanitizeString(row.provincia_reserva, 100);
  const sanitizedPais = sanitizeString(row.pais, 100) || "Argentina";
  const sanitizedNumeroSobreReserva = sanitizeString(
    row.numero_sobre_reserva,
    50
  );
  const sanitizedNumeroSobreRefuerzo = sanitizeString(
    row.numero_sobre_refuerzo,
    50
  );

  // 🔒 Validar y sanitizar emails
  let sanitizedRealizadorVenta = row.realizador_venta?.trim() || null;
  if (sanitizedRealizadorVenta && isEmail(sanitizedRealizadorVenta)) {
    if (!isValidEmail(sanitizedRealizadorVenta)) {
      sanitizedRealizadorVenta = null; // Invalidar email inválido
    }
  }

  let sanitizedRealizadorVentaAdicional =
    row.realizador_venta_adicional?.trim() || null;
  if (
    sanitizedRealizadorVentaAdicional &&
    isEmail(sanitizedRealizadorVentaAdicional)
  ) {
    if (!isValidEmail(sanitizedRealizadorVentaAdicional)) {
      sanitizedRealizadorVentaAdicional = null; // Invalidar email inválido
    }
  }

  let user_uid: string | null = null;
  if (sanitizedRealizadorVenta && isEmail(sanitizedRealizadorVenta)) {
    user_uid = cache?.isLoaded
      ? findUserByEmailInCache(sanitizedRealizadorVenta, cache)
      : await findUserByEmailInTeam(
          sanitizedRealizadorVenta,
          teamId,
          userUID,
          cache
        );
  }

  let user_uid_adicional: string | null = null;
  if (
    sanitizedRealizadorVentaAdicional &&
    isEmail(sanitizedRealizadorVentaAdicional)
  ) {
    user_uid_adicional = cache?.isLoaded
      ? findUserByEmailInCache(sanitizedRealizadorVentaAdicional, cache)
      : await findUserByEmailInTeam(
          sanitizedRealizadorVentaAdicional,
          teamId,
          userUID,
          cache
        );
  }

  // 🔒 Validar valores numéricos
  const valorReserva = parseNumber(row.valor_reserva);
  const valorReservaValidation = validateNumericValue(
    valorReserva,
    "valor_reserva"
  );
  if (!valorReservaValidation.valid) {
    throw new Error(`valor_reserva: ${valorReservaValidation.error}`);
  }

  const porcentajePuntaCompradora = parseNumber(
    row.porcentaje_punta_compradora
  );
  const porcentajePuntaCompradoraValidation = validateNumericValue(
    porcentajePuntaCompradora,
    "porcentaje_punta_compradora"
  );
  if (!porcentajePuntaCompradoraValidation.valid) {
    throw new Error(
      `porcentaje_punta_compradora: ${porcentajePuntaCompradoraValidation.error}`
    );
  }

  return {
    fecha_reserva: parseDate(row.fecha_reserva),
    direccion_reserva: sanitizedDireccion,
    tipo_operacion: row.tipo_operacion?.trim() || "",
    valor_reserva: parseNumber(row.valor_reserva),
    estado: row.estado?.trim() || "",
    porcentaje_punta_compradora: parseNumber(row.porcentaje_punta_compradora),
    porcentaje_punta_vendedora: parseNumber(row.porcentaje_punta_vendedora),
    punta_compradora: parseBoolean(row.punta_compradora),
    punta_vendedora: parseBoolean(row.punta_vendedora),
    tipo_inmueble: sanitizeString(row.tipo_inmueble, 50) || null,
    // Si no hay fecha_operacion, usar fecha_reserva para que aparezca en queries ordenados
    fecha_operacion: parseDate(row.fecha_operacion) || "",
    fecha_captacion: parseDate(row.fecha_captacion) || "",
    numero_casa: sanitizedNumeroCasa || null,
    localidad_reserva: sanitizedLocalidad || null,
    provincia_reserva: sanitizedProvincia || null,
    porcentaje_honorarios_broker: parseNumber(row.porcentaje_honorarios_broker),
    exclusiva: parseBoolean(row.exclusiva),
    no_exclusiva: parseBoolean(row.no_exclusiva),
    numero_sobre_reserva: sanitizedNumeroSobreReserva || null,
    numero_sobre_refuerzo: sanitizedNumeroSobreRefuerzo || null,
    monto_sobre_reserva: parseNumber(row.monto_sobre_reserva),
    monto_sobre_refuerzo: parseNumber(row.monto_sobre_refuerzo),
    referido: sanitizedReferido || null,
    compartido: sanitizedCompartido || null,
    porcentaje_compartido: parseNumber(row.porcentaje_compartido),
    porcentaje_referido: parseNumber(row.porcentaje_referido),
    realizador_venta: sanitizedRealizadorVenta,
    user_uid: user_uid || null, // Agregar user_uid si se encontró por email
    porcentaje_honorarios_asesor: parseNumber(row.porcentaje_honorarios_asesor),
    realizador_venta_adicional: sanitizedRealizadorVentaAdicional,
    user_uid_adicional: user_uid_adicional || null, // Agregar user_uid_adicional si se encontró por email
    porcentaje_honorarios_asesor_adicional: parseNumber(
      row.porcentaje_honorarios_asesor_adicional
    ),
    observaciones: sanitizedObservaciones || null,
    pais: sanitizedPais,
    gastos_operacion: parseNumber(row.gastos_operacion),
    captacion_no_es_mia: parseBoolean(row.captacion_no_es_mia),
    teamId,
    createdAt: now,
    updatedAt: now,
    importedFromCSV: true,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No autorizado: Token no proporcionado" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    // Parsear el formulario
    const form = formidable({ maxFileSize: MAX_FILE_SIZE });

    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res
        .status(400)
        .json({ message: "No se proporcionó ningún archivo" });
    }

    // Obtener teamId del formulario o del usuario autenticado
    const teamIdField = fields.teamId;
    let teamId = Array.isArray(teamIdField) ? teamIdField[0] : teamIdField;

    // Si no se proporciona teamId, obtenerlo del usuario autenticado
    if (!teamId || teamId.trim() === "") {
      try {
        // Obtener datos del usuario
        const userDoc = await db.collection("usuarios").doc(userUID).get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          // Si el usuario tiene teamId en su documento, usarlo
          if (userData?.teamId) {
            teamId = userData.teamId;
          } else {
            // Si es team leader, usar su UID como teamId
            const userAsLeader = await db
              .collection("teams")
              .where("teamLeadID", "==", userUID)
              .limit(1)
              .get();
            if (!userAsLeader.empty) {
              teamId = userUID;
            } else if (userData?.email) {
              // Si es miembro de un equipo, obtener el teamLeadID
              const userAsMember = await db
                .collection("teams")
                .where("email", "==", userData.email)
                .limit(1)
                .get();
              if (!userAsMember.empty) {
                teamId = userAsMember.docs[0].data().teamLeadID;
              } else {
                // Si no está en ningún equipo, usar su UID como teamId
                teamId = userUID;
              }
            } else {
              // Fallback: usar el UID del usuario como teamId
              teamId = userUID;
            }
          }
        } else {
          // Si no existe el documento del usuario, usar su UID como teamId
          teamId = userUID;
        }
      } catch (error) {
        console.error("Error obteniendo teamId del usuario:", error);
        // Fallback: usar el UID del usuario como teamId
        teamId = userUID;
      }
    }

    // Garantizar que teamId siempre tenga un valor
    if (!teamId) {
      teamId = userUID;
    }

    // Detectar tipo de archivo
    const fileName = file.originalFilename || "";
    const isExcel =
      fileName.toLowerCase().endsWith(".xlsx") ||
      fileName.toLowerCase().endsWith(".xls");

    let rows: OperationRow[] = [];

    if (isExcel) {
      // Procesar archivo Excel

      const workbook = XLSX.readFile(file.filepath, {
        cellDates: true, // Convertir fechas automáticamente
        cellNF: false, // No usar formato numérico
      });

      let sheetName =
        workbook.SheetNames.find(
          (name) => name.toLowerCase() === "operaciones"
        ) || workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON con raw: false para obtener valores formateados
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false, // Obtener valores formateados (fechas como strings)
        dateNF: "yyyy-mm-dd", // Formato de fecha preferido
      }) as any[];

      if (jsonData.length < 2) {
        return res
          .status(400)
          .json({ message: "El archivo Excel está vacío o no tiene datos" });
      }

      // 🔹 Buscar la fila de headers (puede estar precedida por metadatos de Numbers u otros)
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
        const row = jsonData[i] as string[];
        // Buscar la fila que contiene headers de fecha (puede ser "fecha_reserva" o "Fecha de Reserva")
        if (row && row.length > 0 && typeof row[0] === "string") {
          const firstCell = row[0].toLowerCase().trim();
          if (
            firstCell.includes("fecha_reserva") ||
            firstCell.includes("fecha reserva") ||
            firstCell.includes("fecha de reserva")
          ) {
            headerRowIndex = i;
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        return res.status(400).json({
          message:
            "No se encontró la fila de encabezados. Asegúrate de usar la plantilla correcta.",
        });
      }

      const headers = (jsonData[headerRowIndex] as string[]).map((h: string) =>
        normalizeHeader(String(h || ""))
      );

      const requiredHeaders = [
        "fecha_reserva",
        "direccion_reserva",
        "tipo_operacion",
        "valor_reserva",
        "estado",
      ];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );
      if (missingHeaders.length > 0) {
        return res.status(400).json({
          message: `Faltan columnas requeridas en el archivo: ${missingHeaders.join(", ")}`,
        });
      }

      // Identificar columnas de fecha
      const dateColumns = [
        "fecha_reserva",
        "fecha_operacion",
        "fecha_captacion",
      ];

      // Convertir filas a objetos
      // Saltar la fila de headers y empezar desde la siguiente fila
      rows = jsonData
        .slice(headerRowIndex + 1)
        .map((row: any[], index) => {
          const rowObj: OperationRow = {};
          headers.forEach((header, colIndex) => {
            let value = row[colIndex];

            // Si es una columna de fecha, procesarla especialmente
            if (
              dateColumns.includes(header) &&
              value !== undefined &&
              value !== null &&
              value !== ""
            ) {
              // XLSX puede devolver fechas como números seriales, strings o Date objects
              const parsedDate = parseDate(value);
              rowObj[header as keyof OperationRow] = parsedDate || "";
            } else {
              // Para otros campos, convertir a string
              rowObj[header as keyof OperationRow] =
                value !== undefined && value !== null
                  ? String(value).trim()
                  : "";
            }
          });
          return rowObj;
        })
        .filter((row) => {
          // Filtrar filas completamente vacías
          return Object.values(row).some(
            (val) => val !== "" && val !== null && val !== undefined
          );
        });
    } else {
      // Procesar archivo CSV
      const fileContent = fs.readFileSync(file.filepath, "utf-8");

      const parseResult = Papa.parse<OperationRow>(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => normalizeHeader(header),
      });

      if (parseResult.errors.length > 0) {
        return res.status(400).json({
          message: "Error al parsear el archivo CSV",
          errors: parseResult.errors.map((e) => ({
            row: e.row || 0,
            error: e.message,
          })),
        });
      }

      rows = parseResult.data;
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "El archivo está vacío" });
    }

    // 🔒 Validar límite de filas
    if (rows.length > MAX_ROWS_PER_IMPORT) {
      return res.status(400).json({
        message: `El archivo contiene demasiadas filas. Máximo permitido: ${MAX_ROWS_PER_IMPORT}. Filas encontradas: ${rows.length}`,
      });
    }

    // Rate limiting deshabilitado temporalmente para testing
    // TODO: Reactivar en producción si es necesario

    // Validar y procesar filas
    const validOperations: Record<string, any>[] = [];
    const importErrors: ImportError[] = [];

    const teamMembersCache = await loadTeamMembersCache(teamId, userUID);

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2;
      const validation = validateRow(row, rowNumber);

      if (validation.valid) {
        try {
          const transformedRow = await transformRow(
            row,
            teamId,
            userUID,
            teamMembersCache
          );
          validOperations.push(transformedRow);
        } catch (error: any) {
          console.error(
            `Fila ${rowNumber}: Error en transformación - ${error.message}`
          );
          importErrors.push({
            row: rowNumber,
            error: `Error al procesar: ${error.message}`,
          });
        }
      } else {
        importErrors.push({
          row: rowNumber,
          error: validation.errors.join("; "),
        });
      }
    }

    // 🔒 Insertar operaciones válidas en lotes con transacciones
    // Firestore limita los batches a 500 operaciones, así que dividimos en chunks
    const BATCH_SIZE = 500;
    let createdCount = 0;
    const chunks = [];

    for (let i = 0; i < validOperations.length; i += BATCH_SIZE) {
      chunks.push(validOperations.slice(i, i + BATCH_SIZE));
    }

    // Procesar cada chunk en un batch separado
    for (const chunk of chunks) {
      const batch = db.batch();

      for (const operation of chunk) {
        const docRef = db.collection("operations").doc();
        batch.set(docRef, operation);
        createdCount++;
      }

      // 🔒 Commit del batch (si falla, no se inserta nada del chunk)
      await batch.commit();
    }

    // Limpiar archivo temporal
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: `Importación completada. ${createdCount} operaciones creadas.`,
      created: createdCount,
      errors: importErrors.length > 0 ? importErrors : undefined,
    });
  } catch (error: any) {
    console.error("Error en importación:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
}
