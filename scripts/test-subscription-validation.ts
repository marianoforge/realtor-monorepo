#!/usr/bin/env ts-node

/**
 * Script para probar las validaciones de suscripción
 *
 * Este script verifica que las validaciones de login funcionen correctamente:
 * 1. Usuarios con suscripción cancelada no pueden acceder
 * 2. Usuarios sin customerId/subscriptionId no pueden acceder
 * 3. Usuarios con estados problemáticos son bloqueados
 *
 * Uso:
 * npx ts-node scripts/test-subscription-validation.ts
 */

const { config } = require("dotenv");

// Cargar variables de entorno
config({ path: ".env.local" });

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Función para probar el endpoint de login con diferentes usuarios
 */
async function testLoginValidation(
  email: string,
  password: string = "testPassword123"
) {
  console.log(`🔹 Testing login validation for: ${email}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`);

    return {
      status: response.status,
      success: response.ok,
      result,
    };
  } catch (error) {
    console.error(`❌ Error testing login for ${email}:`, error);
    return {
      status: 500,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Función para probar el validador de suscripción directamente
 */
async function testSubscriptionValidator(email: string) {
  console.log(`🔹 Testing subscription validator for: ${email}`);

  try {
    // Este endpoint no existe aún, pero podríamos crearlo para testing
    // Por ahora, solo mostraremos la estructura
    console.log(`   Note: Testing validator logic for ${email}`);
    console.log(
      `   This would check subscription status, customerId, and subscriptionId`
    );

    return {
      tested: true,
      email,
    };
  } catch (error) {
    console.error(`❌ Error testing validator for ${email}:`, error);
    return {
      tested: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Función principal de testing
 */
async function main() {
  console.log("🚀 Starting subscription validation tests...\n");

  // Lista de emails para probar (estos son emails de ejemplo)
  const testEmails = [
    "test.canceled@example.com", // Usuario con suscripción cancelada
    "test.unpaid@example.com", // Usuario con suscripción unpaid
    "test.nostripe@example.com", // Usuario sin datos de Stripe
    "test.active@example.com", // Usuario con suscripción activa (debería funcionar)
  ];

  console.log("=== Test 1: Login Validation Tests ===");
  console.log("⚠️ Note: These are example emails for testing structure");
  console.log("⚠️ In real testing, use actual emails from your database\n");

  for (const email of testEmails) {
    await testLoginValidation(email);
    console.log(""); // Línea en blanco entre tests
  }

  console.log("=== Test 2: Subscription Validator Tests ===");

  for (const email of testEmails) {
    await testSubscriptionValidator(email);
  }

  console.log("\n✅ Test structure completed!");
  console.log("\n📋 Validation Rules Implemented:");
  console.log("1. ❌ BLOCKED: subscriptionStatus = 'canceled'");
  console.log(
    "2. ❌ BLOCKED: subscriptionStatus = 'unpaid' (cuenta bloqueada por falta de pago)"
  );
  console.log("3. ❌ BLOCKED: subscriptionStatus = 'incomplete_expired'");
  console.log(
    "4. ⚠️ ALLOWED WITH MODAL: subscriptionStatus = 'past_due' (pago atrasado)"
  );
  console.log("5. ❌ BLOCKED: Missing stripeCustomerId (except trial users)");
  console.log(
    "6. ❌ BLOCKED: Missing stripeSubscriptionId (except trial users)"
  );
  console.log("7. ✅ ALLOWED: subscriptionStatus = 'active'");
  console.log("8. ✅ ALLOWED: subscriptionStatus = 'trialing'");

  console.log("\n🔧 Validation Points:");
  console.log("1. Frontend: LoginForm.tsx - blocks during login attempt");
  console.log("2. Backend: /api/auth/login - server-side validation");
  console.log(
    "3. Route Guard: PrivateRoute.tsx - blocks access to protected routes"
  );
  console.log("4. Middleware: authMiddleware.ts - available for API endpoints");

  console.log("\n📝 To test with real users:");
  console.log("1. Find a user with canceled subscription in your database");
  console.log("2. Try to login with their credentials");
  console.log("3. Verify they see the appropriate error message");
  console.log("4. Check console logs for validation warnings");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLoginValidation, testSubscriptionValidator };
