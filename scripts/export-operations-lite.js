/**
 * Script para exportar operaciones en formato LITE para n8n/Pinecone
 * Solo incluye campos esenciales para reducir el tamaño
 */

// Cargar variables de entorno
require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

const db = admin.firestore();

// Campos esenciales para el bot
const ESSENTIAL_FIELDS = [
  "id",
  "teamId",
  "user_uid",
  "fecha_operacion",
  "fecha_reserva",
  "direccion_reserva",
  "localidad_reserva",
  "provincia_reserva",
  "tipo_operacion",
  "tipo_inmueble",
  "valor_reserva",
  "honorarios_asesor",
  "honorarios_broker",
  "estado",
  "realizador_venta",
  "punta_compradora",
  "punta_vendedora",
];

function extractEssentialFields(operation) {
  const lite = {};
  ESSENTIAL_FIELDS.forEach((field) => {
    if (operation[field] !== undefined) {
      lite[field] = operation[field];
    }
  });
  return lite;
}

async function exportOperationsLite() {
  try {
    console.log("🔄 Iniciando exportación LITE de operaciones...");

    const snapshot = await db.collection("operations").get();

    if (snapshot.empty) {
      console.log("⚠️  No se encontraron operaciones");
      return;
    }

    // Mapear solo campos esenciales
    const operations = snapshot.docs.map((doc) => {
      const fullData = { id: doc.id, ...doc.data() };
      return extractEssentialFields(fullData);
    });

    console.log(`✅ Se encontraron ${operations.length} operaciones`);

    const exportData = {
      exportDate: new Date().toISOString(),
      totalOperations: operations.length,
      version: "lite",
      operations: operations,
      metadata: {
        description: "Versión LITE - Solo campos esenciales",
        filterBy: "teamId",
        fields: ESSENTIAL_FIELDS,
      },
    };

    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `operations-lite-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);
    const latestFilepath = path.join(exportDir, "operations-lite-latest.json");

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf-8");
    fs.writeFileSync(
      latestFilepath,
      JSON.stringify(exportData, null, 2),
      "utf-8"
    );

    // Calcular tamaño
    const stats = fs.statSync(latestFilepath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Exportación LITE completada:`);
    console.log(`   📄 Archivo: ${latestFilepath}`);
    console.log(`   📊 Tamaño: ${fileSizeInMB} MB`);
    console.log(`   🔢 Total operaciones: ${operations.length}`);
    console.log(`   📋 Campos incluidos: ${ESSENTIAL_FIELDS.length}`);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

exportOperationsLite()
  .then(() => {
    console.log("\n✅ Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
