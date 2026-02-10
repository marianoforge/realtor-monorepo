/* eslint-disable no-console */
/**
 * Script para probar el sistema de recordatorios de verificación
 *
 * Este script permite:
 * 1. Crear usuarios de prueba en la colección verifications
 * 2. Probar el endpoint de recordatorios manualmente
 * 3. Verificar que los emails se envían correctamente
 *
 * Uso:
 * npx ts-node scripts/test-verification-reminder.ts
 */

import * as path from "path";

import * as dotenv from "dotenv";
import fetch from "node-fetch";

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

interface TestUser {
  email: string;
  firstName: string;
  lastName: string;
  agenciaBroker: string;
  numeroTelefono: string;
  currency: string;
  currencySymbol: string;
  verificationToken: string;
}

async function createTestUser(hoursAgo: number = 25): Promise<TestUser> {
  const testUser: TestUser = {
    email: `test-${Date.now()}@example.com`,
    firstName: "Usuario",
    lastName: "Prueba",
    agenciaBroker: "Agencia de Prueba",
    numeroTelefono: "+54 11 1234 5678",
    currency: "USD",
    currencySymbol: "$",
    verificationToken: `test-token-${Date.now()}`,
  };

  console.log(`🔹 Creando usuario de prueba: ${testUser.email}`);

  // Simular un usuario que se registró hace X horas
  const createdAt = new Date();
  createdAt.setHours(createdAt.getHours() - hoursAgo);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/test/create-verification-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.CRON_API_KEY || "",
        },
        body: JSON.stringify({
          ...testUser,
          createdAt: createdAt.toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error creando usuario de prueba: ${response.statusText}`
      );
    }

    console.log(`✅ Usuario de prueba creado: ${testUser.email}`);
    return testUser;
  } catch (error) {
    console.error("❌ Error creando usuario de prueba:", error);
    throw error;
  }
}

async function testVerificationReminder(): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cronApiKey = process.env.CRON_API_KEY;

  if (!cronApiKey) {
    throw new Error(
      "CRON_API_KEY no está configurada en las variables de entorno"
    );
  }

  console.log("🔹 Ejecutando cron job de recordatorio de verificación...");

  try {
    const response = await fetch(`${baseUrl}/api/cron/verification-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": cronApiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Error en cron job: ${result.message}`);
    }

    console.log("✅ Cron job ejecutado exitosamente");
    console.log("📊 Resultado:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("❌ Error ejecutando cron job:", error);
    throw error;
  }
}

async function cleanupTestUsers(): Promise<void> {
  console.log("🧹 Limpiando usuarios de prueba...");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/test/cleanup-verification-users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.CRON_API_KEY || "",
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Limpieza completada:", result.message);
    } else {
      console.warn(
        "⚠️ No se pudo limpiar automáticamente. Limpia manualmente los usuarios de prueba."
      );
    }
  } catch (error) {
    console.warn("⚠️ Error en limpieza automática:", error);
  }
}

async function main() {
  console.log(
    "🚀 Iniciando prueba del sistema de recordatorios de verificación\n"
  );

  try {
    // Verificar variables de entorno
    const requiredEnvVars = [
      "NEXT_PUBLIC_BASE_URL",
      "CRON_API_KEY",
      "MAILERSEND_API_KEY",
      "MAILERSEND_FROM_EMAIL",
      "MAILERSEND_FROM_NAME",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.error("❌ Faltan variables de entorno:");
      missingVars.forEach((varName) => console.error(`   - ${varName}`));
      process.exit(1);
    }

    console.log("✅ Variables de entorno verificadas\n");

    // Paso 1: Crear usuarios de prueba
    console.log("📝 PASO 1: Creando usuarios de prueba...");
    const testUser1 = await createTestUser(25); // 25 horas atrás
    const testUser2 = await createTestUser(12); // 12 horas atrás (no debería recibir recordatorio)
    const testUser3 = await createTestUser(48); // 48 horas atrás

    console.log("\n");

    // Paso 2: Ejecutar cron job
    console.log("⚡ PASO 2: Ejecutando cron job de recordatorios...");
    const result = await testVerificationReminder();

    console.log("\n");

    // Paso 3: Verificar resultados
    console.log("🔍 PASO 3: Verificando resultados...");
    const { summary } = result;

    if (summary.emailsSent >= 2) {
      console.log(
        "✅ Test exitoso: Se enviaron recordatorios a usuarios con más de 24 horas"
      );
    } else {
      console.log(
        "⚠️ Test parcial: Se enviaron menos recordatorios de los esperados"
      );
    }

    if (summary.errors > 0) {
      console.log("❌ Se encontraron errores:");
      summary.errorDetails.forEach((error: string) =>
        console.log(`   - ${error}`)
      );
    }

    console.log("\n");

    // Paso 4: Segundo test para verificar que no se envían duplicados
    console.log("🔄 PASO 4: Probando prevención de duplicados...");
    const result2 = await testVerificationReminder();

    if (result2.summary.emailsSkipped >= 2) {
      console.log("✅ Prevención de duplicados funciona correctamente");
    } else {
      console.log("⚠️ La prevención de duplicados podría no estar funcionando");
    }

    console.log("\n📋 RESUMEN FINAL:");
    console.log(
      `   - Primera ejecución: ${summary.emailsSent} emails enviados, ${summary.emailsSkipped} omitidos`
    );
    console.log(
      `   - Segunda ejecución: ${result2.summary.emailsSent} emails enviados, ${result2.summary.emailsSkipped} omitidos`
    );
    console.log(
      `   - Errores totales: ${summary.errors + result2.summary.errors}`
    );
  } catch (error) {
    console.error("\n❌ Error en la prueba:", error);
    process.exit(1);
  } finally {
    // Limpieza
    await cleanupTestUsers();
  }

  console.log("\n🎉 Prueba completada exitosamente!");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

export { main as testVerificationReminder };
