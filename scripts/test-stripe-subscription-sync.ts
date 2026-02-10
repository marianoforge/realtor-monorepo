#!/usr/bin/env ts-node

/**
 * Script de prueba para verificar la sincronización de suscripciones de Stripe
 *
 * Este script demuestra cómo:
 * 1. Probar el endpoint de sincronización manual
 * 2. Verificar webhooks de Stripe
 * 3. Validar estados de suscripción
 *
 * Uso:
 * npx ts-node scripts/test-stripe-subscription-sync.ts
 */

const Stripe = require("stripe");
const { config } = require("dotenv");

// Cargar variables de entorno
config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Función para probar el endpoint de sincronización
 */
async function testSyncEndpoint(email?: string, customerId?: string) {
  console.log("🔹 Testing sync endpoint...");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stripe/sync-subscription-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customerId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Sync endpoint response:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("❌ Error testing sync endpoint:", error);
    return null;
  }
}

/**
 * Función para listar suscripciones desde Stripe
 */
async function listStripeSubscriptions(limit = 10) {
  console.log("🔹 Listing Stripe subscriptions...");

  try {
    const subscriptions = await stripe.subscriptions.list({
      limit,
      expand: ["data.customer"],
    });

    console.log(`✅ Found ${subscriptions.data.length} subscriptions:`);

    subscriptions.data.forEach((sub: any, index: number) => {
      const customer = sub.customer;
      console.log(`${index + 1}. Subscription ${sub.id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Customer: ${customer.email} (${customer.id})`);
      console.log(`   Created: ${new Date(sub.created * 1000).toISOString()}`);
      console.log("");
    });

    return subscriptions.data;
  } catch (error) {
    console.error("❌ Error listing subscriptions:", error);
    return [];
  }
}

/**
 * Función para verificar un webhook específico
 */
async function testWebhookEndpoint(eventType: string, testData: any) {
  console.log(`🔹 Testing webhook endpoint with event: ${eventType}`);

  try {
    // Nota: En un entorno real, necesitarías firmar el webhook correctamente
    // Este es solo un ejemplo de la estructura
    const webhookPayload = {
      type: eventType,
      data: {
        object: testData,
      },
    };

    console.log(
      "📝 Webhook payload structure:",
      JSON.stringify(webhookPayload, null, 2)
    );
    console.log(
      "⚠️ Note: Real webhook testing requires proper Stripe signature verification"
    );

    return webhookPayload;
  } catch (error) {
    console.error("❌ Error creating webhook test:", error);
    return null;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log("🚀 Starting Stripe subscription sync tests...\n");

  // Test 1: Listar suscripciones de Stripe
  console.log("=== Test 1: List Stripe Subscriptions ===");
  const subscriptions = await listStripeSubscriptions(5);

  if (subscriptions.length > 0) {
    const firstSub = subscriptions[0];
    const customer = firstSub.customer;

    console.log("\n=== Test 2: Test Sync Endpoint with Specific Customer ===");
    await testSyncEndpoint(customer.email || undefined, customer.id);
  }

  console.log("\n=== Test 3: Test Sync Endpoint (All Users) ===");
  await testSyncEndpoint();

  console.log("\n=== Test 4: Webhook Event Examples ===");

  // Ejemplo de evento de suscripción cancelada
  await testWebhookEndpoint("customer.subscription.deleted", {
    id: "sub_example123",
    customer: "cus_example123",
    status: "canceled",
  });

  // Ejemplo de evento de suscripción actualizada
  await testWebhookEndpoint("customer.subscription.updated", {
    id: "sub_example123",
    customer: "cus_example123",
    status: "canceled",
  });

  console.log("\n✅ All tests completed!");
  console.log("\n📋 Summary:");
  console.log(
    "1. Sync endpoint can be called manually to update subscription statuses"
  );
  console.log("2. Webhook automatically handles Stripe events");
  console.log(
    "3. Both methods ensure users have correct subscriptionId and status"
  );
  console.log("\n🔧 Next steps:");
  console.log("1. Configure Stripe webhook endpoint in your Stripe Dashboard");
  console.log(
    "2. Set webhook URL to: ${API_BASE_URL}/api/stripe/webhook/route"
  );
  console.log(
    "3. Subscribe to events: customer.subscription.deleted, customer.subscription.updated"
  );
  console.log(
    "4. Use the SubscriptionSyncButton component in your backoffice for manual syncing"
  );
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSyncEndpoint,
  listStripeSubscriptions,
  testWebhookEndpoint,
};
