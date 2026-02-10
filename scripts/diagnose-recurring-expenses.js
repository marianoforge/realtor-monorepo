/**
 * Script para diagnosticar problemas con gastos recurrentes
 * Analiza un usuario específico y también verifica el estado general
 */

const { config } = require("dotenv");
config({ path: ".env.local" });

const admin = require("firebase-admin");

// Inicializar Firebase Admin si no está inicializado
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

// Usuario específico a analizar
const TARGET_USER_UID = "kI0AGcfYhNSk4tWTtRYBkKkDmqQ2";

async function diagnoseRecurringExpenses() {
  console.log("🔍 DIAGNÓSTICO DE GASTOS RECURRENTES");
  console.log("=".repeat(60));
  console.log(`📅 Fecha actual: ${new Date().toISOString()}`);
  console.log(`👤 Usuario objetivo: ${TARGET_USER_UID}`);
  console.log("=".repeat(60));

  try {
    // 1. Analizar gastos recurrentes del usuario específico
    console.log("\n📊 ANÁLISIS DEL USUARIO ESPECÍFICO");
    console.log("-".repeat(40));

    const userExpensesQuery = await db
      .collection("expenses")
      .where("user_uid", "==", TARGET_USER_UID)
      .where("isRecurring", "==", true)
      .get();

    if (userExpensesQuery.empty) {
      console.log("❌ No se encontraron gastos recurrentes para este usuario");
      return;
    }

    console.log(`✅ Encontrados ${userExpensesQuery.size} gastos recurrentes`);

    // Agrupar por tipo de gasto
    const expenseGroups = new Map();

    userExpensesQuery.docs.forEach((doc) => {
      const expense = doc.data();
      const key = `${expense.description}_${expense.amount}_${expense.expenseType}`;

      if (!expenseGroups.has(key)) {
        expenseGroups.set(key, []);
      }
      expenseGroups.get(key).push({ id: doc.id, ...expense });
    });

    console.log(
      `\n📋 ${expenseGroups.size} tipos únicos de gastos recurrentes:\n`
    );

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let issuesFound = 0;

    for (const [key, expenses] of Array.from(expenseGroups.entries())) {
      // Ordenar por fecha
      expenses.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const oldestDate = new Date(expenses[0].date);
      const newestDate = new Date(expenses[expenses.length - 1].date);

      console.log(`\n📌 Gasto: "${expenses[0].description}"`);
      console.log(`   💰 Monto: ${expenses[0].amount}`);
      console.log(`   📂 Tipo: ${expenses[0].expenseType}`);
      console.log(
        `   📅 Rango: ${oldestDate.toISOString().split("T")[0]} → ${newestDate.toISOString().split("T")[0]}`
      );
      console.log(`   📊 Registros existentes: ${expenses.length}`);

      // Verificar meses faltantes
      const existingMonths = new Set();
      expenses.forEach((exp) => {
        const date = new Date(exp.date);
        existingMonths.add(
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        );
      });

      console.log(
        `   📆 Meses existentes: ${Array.from(existingMonths).sort().join(", ")}`
      );

      // Calcular meses que deberían existir
      const expectedMonths = [];
      const iterDate = new Date(oldestDate);

      while (
        iterDate.getFullYear() < currentYear ||
        (iterDate.getFullYear() === currentYear &&
          iterDate.getMonth() <= currentMonth)
      ) {
        expectedMonths.push(
          `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, "0")}`
        );
        iterDate.setMonth(iterDate.getMonth() + 1);
      }

      const missingMonths = expectedMonths.filter(
        (m) => !existingMonths.has(m)
      );

      if (missingMonths.length > 0) {
        console.log(`   ⚠️  MESES FALTANTES: ${missingMonths.join(", ")}`);
        issuesFound++;
      } else {
        console.log(`   ✅ Todos los meses están completos`);
      }
    }

    // 2. Análisis general - verificar otros usuarios con problemas similares
    console.log("\n\n" + "=".repeat(60));
    console.log("📊 ANÁLISIS GENERAL - TODOS LOS USUARIOS");
    console.log("-".repeat(40));

    const allRecurringQuery = await db
      .collection("expenses")
      .where("isRecurring", "==", true)
      .get();

    console.log(
      `\n📈 Total de gastos recurrentes en el sistema: ${allRecurringQuery.size}`
    );

    // Agrupar por usuario
    const userStats = new Map();

    allRecurringQuery.docs.forEach((doc) => {
      const expense = doc.data();
      const userId = expense.user_uid;
      const expenseDate = new Date(expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;

      if (!userStats.has(userId)) {
        userStats.set(userId, {
          total: 0,
          lastMonth: monthKey,
          hasNovDec: false,
          hasCurrentMonth: false,
        });
      }

      const stats = userStats.get(userId);
      stats.total++;

      if (monthKey > stats.lastMonth) {
        stats.lastMonth = monthKey;
      }

      // Verificar si tiene noviembre o diciembre 2024, enero 2026
      if (
        monthKey === "2024-11" ||
        monthKey === "2024-12" ||
        monthKey === "2025-01" ||
        monthKey === "2026-01"
      ) {
        stats.hasNovDec = true;
      }

      // Verificar si tiene el mes actual
      const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
      if (monthKey === currentMonthKey) {
        stats.hasCurrentMonth = true;
      }
    });

    console.log(`\n👥 Usuarios con gastos recurrentes: ${userStats.size}`);

    // Identificar usuarios con posibles problemas (último mes es octubre 2024 o antes)
    const usersWithIssues = [];
    let usersWithCurrentMonth = 0;

    userStats.forEach((stats, userId) => {
      if (stats.hasCurrentMonth) {
        usersWithCurrentMonth++;
      }

      // Si el último mes es antes de noviembre 2024, hay un problema
      if (stats.lastMonth <= "2024-10") {
        usersWithIssues.push({
          userId,
          lastMonth: stats.lastMonth,
          total: stats.total,
        });
      }
    });

    console.log(
      `\n✅ Usuarios con gastos en el mes actual: ${usersWithCurrentMonth}/${userStats.size}`
    );
    console.log(
      `⚠️  Usuarios con posibles problemas (último gasto ≤ octubre 2024): ${usersWithIssues.length}`
    );

    if (usersWithIssues.length > 0) {
      console.log("\n📋 Usuarios afectados:");
      usersWithIssues.slice(0, 20).forEach((u) => {
        const isTargetUser =
          u.userId === TARGET_USER_UID ? " ⭐ (usuario reportado)" : "";
        console.log(
          `   - ${u.userId}: último mes ${u.lastMonth}, ${u.total} gastos${isTargetUser}`
        );
      });

      if (usersWithIssues.length > 20) {
        console.log(`   ... y ${usersWithIssues.length - 20} usuarios más`);
      }
    }

    // 3. Ver el historial de cuando se crearon gastos recurrentes por mes
    console.log("\n\n" + "=".repeat(60));
    console.log("📊 DISTRIBUCIÓN DE GASTOS RECURRENTES POR MES");
    console.log("-".repeat(40));

    const monthlyDistribution = new Map();
    allRecurringQuery.docs.forEach((doc) => {
      const expense = doc.data();
      const expenseDate = new Date(expense.date);
      const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;

      monthlyDistribution.set(
        monthKey,
        (monthlyDistribution.get(monthKey) || 0) + 1
      );
    });

    // Ordenar por mes
    const sortedMonths = Array.from(monthlyDistribution.entries()).sort(
      (a, b) => a[0].localeCompare(b[0])
    );

    // Mostrar últimos 12 meses
    console.log("\nÚltimos 18 meses:");
    sortedMonths.slice(-18).forEach(([month, count]) => {
      const bar = "█".repeat(Math.min(count, 50));
      console.log(`   ${month}: ${count.toString().padStart(4)} ${bar}`);
    });

    // Resumen final
    console.log("\n\n" + "=".repeat(60));
    console.log("📝 RESUMEN");
    console.log("-".repeat(40));
    console.log(`👤 Usuario reportado: ${TARGET_USER_UID}`);
    console.log(
      `⚠️  Tipos de gastos con problemas para este usuario: ${issuesFound}`
    );
    console.log(`👥 Total usuarios afectados: ${usersWithIssues.length}`);

    if (usersWithIssues.length > 1) {
      console.log("\n⚠️  CONCLUSIÓN: El problema afecta a MÚLTIPLES usuarios");
      console.log(
        "   Posible causa: El cron job no se ejecutó correctamente desde octubre"
      );
    } else if (usersWithIssues.length === 1) {
      console.log(
        "\n⚠️  CONCLUSIÓN: El problema parece afectar SOLO a este usuario"
      );
    } else if (issuesFound > 0) {
      console.log(
        "\n⚠️  CONCLUSIÓN: El usuario tiene meses faltantes pero otros usuarios están ok"
      );
    } else {
      console.log("\n✅ CONCLUSIÓN: No se detectaron problemas");
    }
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    throw error;
  }
}

// Ejecutar
diagnoseRecurringExpenses()
  .then(() => {
    console.log("\n✅ Diagnóstico completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
