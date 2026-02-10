/**
 * Script para arreglar gastos recurrentes de un usuario específico
 * Este script encuentra gastos marcados como recurrentes que no se han replicado
 * y crea las repeticiones faltantes desde la fecha original hasta hoy
 */

const { config } = require("dotenv");
const admin = require("firebase-admin");

// Cargar variables de entorno
config({ path: ".env.local" });

const TARGET_USER_UID = "6RX7UJcIpIemouOOEfF4QsM7bA22";
const TARGET_USER_EMAIL = "broker@remax-icon.cl";

// Inicializar Firebase Admin si no está ya inicializado
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

async function fixUserRecurringExpenses() {
  console.log(
    `🔹 Iniciando fix de gastos recurrentes para usuario: ${TARGET_USER_EMAIL}`
  );
  console.log(`🔹 UID: ${TARGET_USER_UID}`);

  try {
    // 1. Obtener todos los gastos recurrentes del usuario
    console.log("🔍 Buscando gastos recurrentes...");

    const recurringExpensesQuery = await db
      .collection("expenses")
      .where("user_uid", "==", TARGET_USER_UID)
      .where("isRecurring", "==", true)
      .get();

    if (recurringExpensesQuery.empty) {
      console.log("❌ No se encontraron gastos recurrentes para este usuario");
      return;
    }

    console.log(
      `✅ Encontrados ${recurringExpensesQuery.size} gastos recurrentes`
    );

    // 2. Agrupar gastos por "tipo" para evitar duplicados
    const expenseGroups = new Map();

    recurringExpensesQuery.docs.forEach((doc) => {
      const expense = doc.data();
      const key = `${expense.description}_${expense.amount}_${expense.expenseType}`;

      if (!expenseGroups.has(key)) {
        expenseGroups.set(key, []);
      }
      expenseGroups.get(key).push({ id: doc.id, ...expense });
    });

    console.log(
      `🔍 Identificados ${expenseGroups.size} tipos únicos de gastos recurrentes`
    );

    // 3. Para cada grupo, verificar qué meses faltan y crearlos
    let totalCreated = 0;
    const currentDate = new Date();
    const batchSize = 450;
    let batch = db.batch();
    let operationCount = 0;

    for (const [key, expenses] of Array.from(expenseGroups.entries())) {
      console.log(`\n📋 Procesando: ${key}`);

      // Encontrar la fecha más antigua de este gasto
      const oldestExpense = expenses.reduce((oldest, current) => {
        return new Date(current.date) < new Date(oldest.date)
          ? current
          : oldest;
      });

      console.log(`   📅 Fecha más antigua: ${oldestExpense.date}`);

      // Obtener todos los meses que ya existen para este gasto
      const existingMonths = new Set();
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        existingMonths.add(monthKey);
      });

      console.log(`   ✅ Meses existentes: ${existingMonths.size}`);

      // Generar todos los meses desde la fecha más antigua hasta hoy
      const startDate = new Date(oldestExpense.date);
      const iterDate = new Date(startDate);
      let monthsToCreate = 0;

      while (iterDate <= currentDate) {
        const monthKey = `${iterDate.getFullYear()}-${iterDate.getMonth()}`;

        if (!existingMonths.has(monthKey)) {
          // Este mes no existe, hay que crearlo
          const formattedDate = iterDate.toISOString().split("T")[0];

          const newExpense = {
            amount: oldestExpense.amount,
            amountInDollars: oldestExpense.amountInDollars,
            expenseType: oldestExpense.expenseType,
            description: oldestExpense.description,
            dollarRate: oldestExpense.dollarRate,
            user_uid: oldestExpense.user_uid,
            otherType: oldestExpense.otherType || "",
            isRecurring: true,
            date: formattedDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const newDocRef = db.collection("expenses").doc();
          batch.set(newDocRef, newExpense);
          operationCount++;
          monthsToCreate++;

          console.log(`   ➕ Creando gasto para: ${formattedDate}`);

          // Si llegamos al límite del lote, comprometer y crear uno nuevo
          if (operationCount >= batchSize) {
            await batch.commit();
            batch = db.batch();
            operationCount = 0;
          }
        }

        // Avanzar al siguiente mes
        iterDate.setMonth(iterDate.getMonth() + 1);
      }

      console.log(`   📊 Gastos a crear para "${key}": ${monthsToCreate}`);
      totalCreated += monthsToCreate;
    }

    // Comprometer cualquier operación restante
    if (operationCount > 0) {
      await batch.commit();
    }

    console.log(`\n🎉 ¡Fix completado!`);
    console.log(`📊 Total de gastos creados: ${totalCreated}`);
    console.log(`👤 Usuario: ${TARGET_USER_EMAIL}`);
  } catch (error) {
    console.error("❌ Error ejecutando fix:", error);
    throw error;
  }
}

// Ejecutar el fix
if (require.main === module) {
  fixUserRecurringExpenses()
    .then(() => {
      console.log("✅ Script completado exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error en el script:", error);
      process.exit(1);
    });
}

module.exports = fixUserRecurringExpenses;
