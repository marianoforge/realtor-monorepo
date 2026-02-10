/**
 * Script para eliminar operaciones importadas con fechas incorrectas
 * Solo elimina operaciones que:
 * 1. Fueron importadas (importedFromCSV: true)
 * 2. Tienen fechas con año < 100 (ej: 0024 en lugar de 2024)
 *
 * Uso: node scripts/fix-imported-operations.js
 */

const admin = require("firebase-admin");
const path = require("path");

// Cargar variables de entorno desde .env.local
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });

// Inicializar Firebase Admin con variables de entorno
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (
    !serviceAccount.projectId ||
    !serviceAccount.privateKey ||
    !serviceAccount.clientEmail
  ) {
    console.error("❌ Faltan variables de entorno de Firebase");
    console.error("   Asegúrate de tener .env.local con:");
    console.error("   - FIREBASE_PROJECT_ID");
    console.error("   - FIREBASE_PRIVATE_KEY");
    console.error("   - FIREBASE_CLIENT_EMAIL");
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

const db = admin.firestore();

async function main() {
  const teamId = "VezAPkti1rZvRttZf0H16GaX2Ut1";

  console.log("🔍 Buscando operaciones importadas con fechas incorrectas...\n");

  // Buscar operaciones importadas de ese equipo
  const snapshot = await db
    .collection("operations")
    .where("teamId", "==", teamId)
    .where("importedFromCSV", "==", true)
    .get();

  if (snapshot.empty) {
    console.log("❌ No se encontraron operaciones importadas para ese equipo.");
    return;
  }

  console.log(`📋 Se encontraron ${snapshot.size} operaciones importadas.\n`);

  // Filtrar solo las que tienen fechas incorrectas (año < 100)
  const operationsToDelete = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const fechaReserva = data.fecha_reserva || "";
    const fechaOperacion = data.fecha_operacion || "";

    // Extraer el año de la fecha (formato YYYY-MM-DD)
    const yearReserva = parseInt(fechaReserva.split("-")[0], 10);
    const yearOperacion = parseInt(fechaOperacion.split("-")[0], 10);

    // Si alguna fecha tiene año < 100, es incorrecta
    const hasIncorrectDate =
      (yearReserva > 0 && yearReserva < 100) ||
      (yearOperacion > 0 && yearOperacion < 100);

    if (hasIncorrectDate) {
      operationsToDelete.push({
        id: doc.id,
        direccion: data.direccion_reserva,
        fecha_reserva: data.fecha_reserva,
        fecha_operacion: data.fecha_operacion,
      });
    }
  });

  if (operationsToDelete.length === 0) {
    console.log("✅ No hay operaciones con fechas incorrectas para eliminar.");
    return;
  }

  console.log(
    `⚠️  Se encontraron ${operationsToDelete.length} operaciones con fechas incorrectas:\n`
  );

  operationsToDelete.forEach((op, index) => {
    console.log(`  ${index + 1}. ID: ${op.id}`);
    console.log(`     Dirección: ${op.direccion}`);
    console.log(`     Fecha Reserva: ${op.fecha_reserva}`);
    console.log(`     Fecha Operación: ${op.fecha_operacion}`);
    console.log("");
  });

  console.log("🗑️  Eliminando operaciones...\n");

  // Eliminar las operaciones
  const batch = db.batch();

  operationsToDelete.forEach((op) => {
    const docRef = db.collection("operations").doc(op.id);
    batch.delete(docRef);
  });

  await batch.commit();

  console.log(
    `✅ Se eliminaron ${operationsToDelete.length} operaciones correctamente.`
  );
  console.log("\n📝 Ahora puedes volver a importar el archivo Excel.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
