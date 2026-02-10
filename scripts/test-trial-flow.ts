/**
 * Script de prueba para el flujo de trial
 * Este script ayuda a probar el nuevo flujo de trial sin necesidad de esperar días reales
 *
 * Uso: npx ts-node scripts/test-trial-flow.ts
 */

import * as path from "path";

import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function testTrialFlow() {
  console.log("🔹 Iniciando pruebas del flujo de trial...\n");

  // Test 1: Verificar endpoint de limpieza de trials
  console.log("📋 Test 1: Probando endpoint de limpieza de trials expirados");
  try {
    const cleanupResponse = await fetch(
      `${BASE_URL}/api/cron/cleanup-expired-trials`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.CRON_API_KEY || "test-key",
        },
      }
    );

    const cleanupData = await cleanupResponse.json();

    if (cleanupResponse.ok) {
      console.log("✅ Limpieza de trials ejecutada correctamente");
      console.log(`   Usuarios eliminados: ${cleanupData.deletedCount}`);
    } else {
      console.log("⚠️ Error en limpieza de trials:", cleanupData.message);
    }
  } catch (error) {
    console.error("❌ Error probando limpieza de trials:", error);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 2: Verificar estructura de endpoints
  console.log("📋 Test 2: Verificando endpoints necesarios");

  const endpoints = [
    "/api/auth/verifyEmail",
    "/api/stripe/create-post-trial-session",
    "/api/cron/cleanup-expired-trials",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
      });

      // Los endpoints deben responder con método no permitido o similar, no 404
      if (response.status !== 404) {
        console.log(`✅ Endpoint disponible: ${endpoint} (${response.status})`);
      } else {
        console.log(`❌ Endpoint no encontrado: ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ Error verificando ${endpoint}:`, error);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test 3: Instrucciones para pruebas manuales
  console.log("📋 Test 3: Instrucciones para pruebas manuales");
  console.log("");
  console.log("Para probar el flujo completo manualmente:");
  console.log("");
  console.log("1. 📝 Registro:");
  console.log("   - Ve a /register");
  console.log("   - Completa el formulario de registro");
  console.log("   - Verifica que recibes el email de verificación");
  console.log("");
  console.log("2. ✉️ Verificación de email:");
  console.log("   - Haz clic en el enlace del email");
  console.log("   - Verifica que te redirige a /login (no a Stripe)");
  console.log('   - El usuario debe crearse con stripeSubscriptionId: "trial"');
  console.log("");
  console.log("3. 🔑 Login:");
  console.log("   - Inicia sesión con las credenciales");
  console.log("   - Verifica que puedes acceder al dashboard");
  console.log("   - Debe mostrar indicador de trial en la navegación");
  console.log("");
  console.log("4. ⏰ Simulación de trial expirado:");
  console.log(
    '   - En Firestore, modifica manualmente el campo "trialEndDate"'
  );
  console.log("   - Ponlo a una fecha pasada (ej: hace 2 días)");
  console.log("   - Recarga la página del dashboard");
  console.log("   - Debe mostrar el modal de pago requerido");
  console.log("");
  console.log("5. 💳 Flujo de pago:");
  console.log('   - Haz clic en "Activar Suscripción" en el modal');
  console.log("   - Verifica que te lleva a Stripe");
  console.log("   - Completa el pago con tarjeta de prueba");
  console.log("   - Verifica que el webhook actualiza la suscripción");
  console.log("");
  console.log("6. 🧹 Limpieza automática:");
  console.log('   - Modifica "trialEndDate" a hace 16 días');
  console.log("   - Ejecuta el cron job de limpieza");
  console.log("   - Verifica que el usuario se elimina automáticamente");

  console.log("\n" + "=".repeat(50) + "\n");

  console.log("📊 Campos de base de datos para verificar:");
  console.log("");
  console.log(
    'En la colección "usuarios" de Firestore, verifica estos campos:'
  );
  console.log(
    '- stripeSubscriptionId: "trial" (durante trial) → ID real (después del pago)'
  );
  console.log('- subscriptionStatus: "trialing" → "active"');
  console.log("- trialStartDate: Timestamp del inicio del trial");
  console.log("- trialEndDate: Timestamp de finalización del trial");
  console.log("- paymentNotificationShown: boolean para controlar modal");
  console.log("- trialConvertedAt: Timestamp de conversión a pago (opcional)");

  console.log("\n✅ Pruebas completadas. ¡Revisa los resultados arriba!");
}

// Ejecutar las pruebas
testTrialFlow().catch(console.error);
