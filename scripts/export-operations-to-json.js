/**
 * Script para exportar todas las operaciones de Firestore a un archivo JSON
 * Este JSON será usado por un bot para responder preguntas sobre operaciones
 *
 * IMPORTANTE: El bot debe filtrar las operaciones por teamId antes de responder
 * para que cada usuario solo vea sus propias operaciones.
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

async function exportOperations() {
  try {
    console.log("🔄 Iniciando exportación de operaciones...");

    // Obtener todas las operaciones de Firestore
    const snapshot = await db.collection("operations").get();

    if (snapshot.empty) {
      console.log("⚠️  No se encontraron operaciones en la base de datos");
      return;
    }

    // Mapear los documentos a objetos
    const operations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Se encontraron ${operations.length} operaciones`);

    // Crear objeto con metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      totalOperations: operations.length,
      operations: operations,
      metadata: {
        version: "1.0",
        description: "Exportación completa de operaciones inmobiliarias",
        filterInstructions:
          "IMPORTANTE: Cuando un usuario haga una pregunta, DEBES filtrar las operaciones comparando el uid del usuario con el campo 'teamId' de cada operación. El 'teamId' contiene el uid del usuario que creó/posee la operación. Solo mostrar las operaciones donde operation.teamId === userUid.",
      },
    };

    // Crear directorio de exportación si no existe
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `operations-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    // También crear una versión "latest" para fácil acceso
    const latestFilepath = path.join(exportDir, "operations-latest.json");

    // Guardar archivo con formato legible
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf-8");
    fs.writeFileSync(
      latestFilepath,
      JSON.stringify(exportData, null, 2),
      "utf-8"
    );

    console.log(`✅ Operaciones exportadas exitosamente:`);
    console.log(`   📄 Archivo con timestamp: ${filepath}`);
    console.log(`   📄 Archivo latest: ${latestFilepath}`);
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total de operaciones: ${operations.length}`);

    // Estadísticas adicionales
    const operationsByType = operations.reduce((acc, op) => {
      acc[op.tipo_operacion] = (acc[op.tipo_operacion] || 0) + 1;
      return acc;
    }, {});

    console.log(`   Por tipo de operación:`);
    Object.entries(operationsByType).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    const operationsByStatus = operations.reduce((acc, op) => {
      acc[op.estado] = (acc[op.estado] || 0) + 1;
      return acc;
    }, {});

    console.log(`   Por estado:`);
    Object.entries(operationsByStatus).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    // Contar usuarios únicos (creadores de operaciones)
    const uniqueUsers = new Set();
    operations.forEach((op) => {
      uniqueUsers.add(op.teamId);
    });

    console.log(`   Usuarios únicos (creadores): ${uniqueUsers.size}`);

    console.log(
      `\n💡 Para usar con tu bot, sube el archivo a Google Drive y configura el bot para:`
    );
    console.log(
      `   1. Leer el JSON desde Google Drive (usa el archivo "operations-latest.json")`
    );
    console.log(`   2. Cuando un usuario haga una pregunta, obtener su uid`);
    console.log(
      `   3. Filtrar las operaciones: operations.filter(op => op.teamId === userUid)`
    );
    console.log(
      `   4. Responder solo con información de las operaciones filtradas`
    );
    console.log(`\n   Nota: teamId = uid del usuario creador de la operación`);
  } catch (error) {
    console.error("❌ Error exportando operaciones:", error);
    throw error;
  }
}

// Ejecutar el script
exportOperations()
  .then(() => {
    console.log("\n✅ Script finalizado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en el script:", error);
    process.exit(1);
  });
