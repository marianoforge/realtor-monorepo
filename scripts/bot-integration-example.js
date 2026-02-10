/**
 * EJEMPLO DE INTEGRACIÓN DEL BOT
 *
 * Este archivo muestra cómo integrar el JSON de operaciones exportado
 * en tu bot (Dialogflow, Rasa, custom bot, etc.)
 *
 * IMPORTANTE: Este es solo un ejemplo de referencia. Adapta el código
 * según el framework de tu bot.
 */

// ============================================
// 1. CARGAR EL JSON (desde Google Drive o local)
// ============================================

/**
 * Opción A: Desde Google Drive (recomendado para producción)
 */
async function loadOperationsFromGoogleDrive() {
  // URL del archivo compartido de Google Drive
  // Debes obtener esta URL después de subir el archivo
  const GOOGLE_DRIVE_FILE_URL =
    "https://drive.google.com/uc?export=download&id=TU_FILE_ID";

  try {
    const response = await fetch(GOOGLE_DRIVE_FILE_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error cargando operaciones:", error);
    throw error;
  }
}

/**
 * Opción B: Desde archivo local (para desarrollo/testing)
 */
function loadOperationsFromLocal() {
  const fs = require("fs");
  const path = require("path");

  const filePath = path.join(__dirname, "../exports/operations-latest.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawData);
}

// ============================================
// 2. FUNCIÓN DE FILTRADO POR USUARIO
// ============================================

/**
 * Filtra las operaciones para un usuario específico
 *
 * @param {Object} exportData - Datos exportados completos
 * @param {string} userUid - UID del usuario que hace la pregunta
 * @returns {Array} - Array de operaciones del usuario
 */
function getUserOperations(exportData, userUid) {
  if (!exportData || !exportData.operations) {
    return [];
  }

  // CRÍTICO: Filtrar SOLO por teamId
  const userOperations = exportData.operations.filter((operation) => {
    return operation.teamId === userUid;
  });

  return userOperations;
}

// ============================================
// 3. FUNCIONES AUXILIARES PARA CONSULTAS
// ============================================

/**
 * Cuenta operaciones por estado
 */
function countOperationsByStatus(operations) {
  return operations.reduce((acc, op) => {
    acc[op.estado] = (acc[op.estado] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Calcula total de comisiones
 */
function calculateTotalCommissions(operations) {
  return operations.reduce((total, op) => {
    return total + (op.honorarios_asesor || 0);
  }, 0);
}

/**
 * Filtra operaciones por fecha
 */
function filterOperationsByDateRange(operations, startDate, endDate) {
  return operations.filter((op) => {
    const opDate = new Date(op.fecha_operacion);
    return opDate >= startDate && opDate <= endDate;
  });
}

/**
 * Filtra operaciones por tipo
 */
function filterOperationsByType(operations, type) {
  return operations.filter(
    (op) => op.tipo_operacion.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Filtra operaciones por ubicación
 */
function filterOperationsByLocation(operations, location) {
  const locationLower = location.toLowerCase();
  return operations.filter((op) => {
    return (
      (op.localidad_reserva &&
        op.localidad_reserva.toLowerCase().includes(locationLower)) ||
      (op.provincia_reserva &&
        op.provincia_reserva.toLowerCase().includes(locationLower)) ||
      (op.pais && op.pais.toLowerCase().includes(locationLower))
    );
  });
}

// ============================================
// 4. MANEJADORES DE INTENCIONES DEL BOT
// ============================================

/**
 * Intent: Contar operaciones totales
 */
async function handleCountOperationsIntent(userUid) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  return `Tienes ${userOps.length} operaciones registradas en el sistema.`;
}

/**
 * Intent: Consultar comisiones totales
 */
async function handleTotalCommissionsIntent(userUid) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  const total = calculateTotalCommissions(userOps);

  return `Has ganado un total de $${total.toLocaleString()} en comisiones.`;
}

/**
 * Intent: Operaciones por estado
 */
async function handleOperationsByStatusIntent(userUid, status) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  const filtered = userOps.filter(
    (op) => op.estado.toLowerCase() === status.toLowerCase()
  );

  return `Tienes ${filtered.length} operaciones en estado ${status}.`;
}

/**
 * Intent: Operaciones del mes actual
 */
async function handleCurrentMonthOperationsIntent(userUid) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthOps = userOps.filter((op) => {
    const opDate = new Date(op.fecha_operacion);
    return (
      opDate.getMonth() === currentMonth && opDate.getFullYear() === currentYear
    );
  });

  return `Este mes tienes ${thisMonthOps.length} operaciones registradas.`;
}

/**
 * Intent: Operaciones por tipo
 */
async function handleOperationsByTypeIntent(userUid, type) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  const filtered = filterOperationsByType(userOps, type);

  return `Tienes ${filtered.length} operaciones de tipo ${type}.`;
}

/**
 * Intent: Operaciones por ubicación
 */
async function handleOperationsByLocationIntent(userUid, location) {
  const data = await loadOperationsFromGoogleDrive();
  const userOps = getUserOperations(data, userUid);

  const filtered = filterOperationsByLocation(userOps, location);

  if (filtered.length === 0) {
    return `No encontré operaciones en ${location}.`;
  }

  const addresses = filtered.map((op) => op.direccion_reserva).join(", ");
  return `Encontré ${filtered.length} operaciones en ${location}: ${addresses}`;
}

// ============================================
// 5. EJEMPLO DE USO EN DIALOGFLOW
// ============================================

/**
 * Webhook handler para Dialogflow
 */
async function dialogflowWebhookHandler(request, response) {
  const intentName = request.body.queryResult.intent.displayName;

  // Obtener el userUid del contexto o sesión
  // Esto depende de cómo identifiques a tus usuarios
  const userUid = request.body.queryResult.outputContexts?.find((ctx) =>
    ctx.name.includes("session-context")
  )?.parameters?.userUid;

  if (!userUid) {
    return response.json({
      fulfillmentText:
        "No pude identificar tu usuario. Por favor inicia sesión.",
    });
  }

  let fulfillmentText;

  try {
    switch (intentName) {
      case "CountOperations":
        fulfillmentText = await handleCountOperationsIntent(userUid);
        break;

      case "TotalCommissions":
        fulfillmentText = await handleTotalCommissionsIntent(userUid);
        break;

      case "OperationsByStatus":
        const status = request.body.queryResult.parameters.status;
        fulfillmentText = await handleOperationsByStatusIntent(userUid, status);
        break;

      case "CurrentMonthOperations":
        fulfillmentText = await handleCurrentMonthOperationsIntent(userUid);
        break;

      case "OperationsByType":
        const type = request.body.queryResult.parameters.type;
        fulfillmentText = await handleOperationsByTypeIntent(userUid, type);
        break;

      case "OperationsByLocation":
        const location = request.body.queryResult.parameters.location;
        fulfillmentText = await handleOperationsByLocationIntent(
          userUid,
          location
        );
        break;

      default:
        fulfillmentText = "No entendí tu pregunta. ¿Podrías reformularla?";
    }

    return response.json({ fulfillmentText });
  } catch (error) {
    console.error("Error en webhook:", error);
    return response.json({
      fulfillmentText:
        "Hubo un error al procesar tu solicitud. Por favor intenta nuevamente.",
    });
  }
}

// ============================================
// 6. EJEMPLO DE USO EN BOT CUSTOM (Express)
// ============================================

/**
 * Endpoint REST para tu bot custom
 */
const express = require("express");
const app = express();
app.use(express.json());

app.post("/bot/query", async (req, res) => {
  const { userUid, query } = req.body;

  if (!userUid) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const data = await loadOperationsFromGoogleDrive();
    const userOps = getUserOperations(data, userUid);

    // Procesamiento simple basado en keywords
    const queryLower = query.toLowerCase();
    let response;

    if (queryLower.includes("cuántas operaciones")) {
      response = `Tienes ${userOps.length} operaciones.`;
    } else if (queryLower.includes("comisiones")) {
      const total = calculateTotalCommissions(userOps);
      response = `Total de comisiones: $${total.toLocaleString()}`;
    } else if (queryLower.includes("este mes")) {
      const now = new Date();
      const thisMonth = userOps.filter((op) => {
        const opDate = new Date(op.fecha_operacion);
        return opDate.getMonth() === now.getMonth();
      });
      response = `Este mes: ${thisMonth.length} operaciones.`;
    } else {
      response =
        "No entendí tu pregunta. Intenta preguntar sobre tus operaciones, comisiones o estadísticas.";
    }

    return res.json({ response });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============================================
// 7. CACHÉ Y OPTIMIZACIÓN
// ============================================

/**
 * Sistema simple de caché para evitar descargar el JSON en cada request
 */
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function loadOperationsWithCache() {
  const now = Date.now();

  // Si hay cache válido, usarlo
  if (cachedData && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  // Cargar datos frescos
  cachedData = await loadOperationsFromGoogleDrive();
  cacheTimestamp = now;

  return cachedData;
}

// ============================================
// 8. VALIDACIÓN DE SEGURIDAD
// ============================================

/**
 * Valida que el userUid sea válido antes de procesar
 */
function validateUserUid(userUid) {
  if (!userUid || typeof userUid !== "string") {
    throw new Error("UID de usuario inválido");
  }

  // Formato típico de Firebase UID: 28 caracteres alfanuméricos
  if (userUid.length < 10 || userUid.length > 128) {
    throw new Error("Formato de UID inválido");
  }

  return true;
}

/**
 * Verifica que NUNCA se devuelvan operaciones de otros usuarios
 */
function verifyOperationsSecurity(operations, userUid) {
  const hasInvalidOps = operations.some((op) => op.teamId !== userUid);

  if (hasInvalidOps) {
    console.error(
      "🚨 ALERTA DE SEGURIDAD: Se intentó devolver operaciones de otros usuarios"
    );
    throw new Error("Error de seguridad en filtrado");
  }

  return true;
}

// ============================================
// 9. EXPORTACIONES
// ============================================

module.exports = {
  // Funciones principales
  loadOperationsFromGoogleDrive,
  loadOperationsFromLocal,
  loadOperationsWithCache,
  getUserOperations,

  // Funciones auxiliares
  countOperationsByStatus,
  calculateTotalCommissions,
  filterOperationsByDateRange,
  filterOperationsByType,
  filterOperationsByLocation,

  // Handlers de intenciones
  handleCountOperationsIntent,
  handleTotalCommissionsIntent,
  handleOperationsByStatusIntent,
  handleCurrentMonthOperationsIntent,
  handleOperationsByTypeIntent,
  handleOperationsByLocationIntent,

  // Webhooks
  dialogflowWebhookHandler,

  // Seguridad
  validateUserUid,
  verifyOperationsSecurity,
};

// ============================================
// 10. EJEMPLO DE USO SIMPLE
// ============================================

/**
 * Ejemplo rápido de uso:
 */
async function exampleUsage() {
  const userUid = "ejemplo-uid-usuario-123";

  try {
    // Cargar datos
    const data = await loadOperationsWithCache();
    console.log(`📊 Total operaciones en BD: ${data.totalOperations}`);

    // Filtrar por usuario
    const userOps = getUserOperations(data, userUid);
    console.log(`👤 Operaciones del usuario: ${userOps.length}`);

    // Calcular comisiones
    const total = calculateTotalCommissions(userOps);
    console.log(`💰 Total comisiones: $${total.toLocaleString()}`);

    // Por estado
    const byStatus = countOperationsByStatus(userOps);
    console.log("📈 Por estado:", byStatus);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Descomentar para probar:
// exampleUsage();
