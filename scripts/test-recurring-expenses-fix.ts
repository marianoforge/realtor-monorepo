/**
 * Script para probar la funcionalidad de gastos recurrentes después del fix
 * Este script ayuda a verificar que el cron job funcione correctamente
 */

import { config } from "dotenv";

// Cargar variables de entorno
config({ path: ".env.local" });

async function testRecurringExpenses() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const API_KEY = process.env.CRON_API_KEY;

  if (!API_KEY) {
    console.error(
      "❌ CRON_API_KEY no está configurada en las variables de entorno"
    );
    process.exit(1);
  }

  const API_URL = `${BASE_URL}/api/cron/process-recurring-expenses`;

  console.log(
    `🔹 Probando procesamiento de gastos recurrentes en ${API_URL}...`
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Error HTTP ${response.status}: ${errorData}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log("✅ Respuesta del servidor:", result);

    if (result.count > 0) {
      console.log(
        `🎉 Se procesaron ${result.count} gastos recurrentes exitosamente!`
      );
    } else {
      console.log(
        "ℹ️ No había gastos recurrentes para procesar o ya estaban actualizados"
      );
    }
  } catch (error) {
    console.error("❌ Error probando gastos recurrentes:", error);
    process.exit(1);
  }
}

// Ejecutar el test
testRecurringExpenses();
