#!/usr/bin/env node

const Stripe = require("stripe");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

class StripeAPITester {
  constructor() {
    this.results = [];
  }

  logTest(test, success, error = null, data = null) {
    this.results.push({ test, success, error, data });
    const status = success ? "✅" : "❌";
    console.log(`${status} ${test}`);
    if (error) console.log(`   Error: ${error}`);
    if (data && success)
      console.log(`   Data: ${JSON.stringify(data, null, 2)}`);
  }

  async testBasicConnectivity() {
    console.log("\n🔗 Testing Basic Stripe Connectivity...");
    try {
      const account = await stripe.accounts.retrieve();
      this.logTest("Basic API Connection", true, null, {
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
      });
    } catch (error) {
      this.logTest("Basic API Connection", false, error.message);
    }
  }

  async testCustomerOperations() {
    console.log("\n👤 Testing Customer Operations...");

    try {
      const customer = await stripe.customers.create({
        email: `test-${Date.now()}@example.com`,
        name: "Test Customer",
        metadata: { test: "true" },
      });
      this.logTest("Customer Creation", true, null, {
        id: customer.id,
        email: customer.email,
      });

      try {
        const retrievedCustomer = await stripe.customers.retrieve(customer.id);
        this.logTest("Customer Retrieval", true, null, {
          id: retrievedCustomer.id,
          email: retrievedCustomer.email,
        });

        await stripe.customers.del(customer.id);
        this.logTest("Customer Cleanup", true);
      } catch (error) {
        this.logTest("Customer Retrieval", false, error.message);
      }
    } catch (error) {
      this.logTest("Customer Creation", false, error.message);
    }
  }

  async testPriceAndProductOperations() {
    console.log("\n💰 Testing Price and Product Operations...");

    try {
      const product = await stripe.products.create({
        name: `Test Product ${Date.now()}`,
        description: "Test product for API validation",
        metadata: { test: "true" },
      });
      this.logTest("Product Creation", true, null, {
        id: product.id,
        name: product.name,
      });

      try {
        const price = await stripe.prices.create({
          currency: "usd",
          unit_amount: 1000,
          product: product.id,
          recurring: { interval: "month" },
          metadata: { test: "true" },
        });
        this.logTest("Price Creation", true, null, {
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
        });

        await stripe.products.update(product.id, { active: false });
        this.logTest("Product/Price Cleanup", true);
      } catch (error) {
        this.logTest("Price Creation", false, error.message);
      }
    } catch (error) {
      this.logTest("Product Creation", false, error.message);
    }
  }

  async testCheckoutSession() {
    console.log("\n🛒 Testing Checkout Session...");

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Test Product" },
              unit_amount: 1000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        metadata: { test: "true" },
      });

      this.logTest("Checkout Session Creation", true, null, {
        id: session.id,
        url: session.url,
        status: session.status,
      });
    } catch (error) {
      this.logTest("Checkout Session Creation", false, error.message);
    }
  }

  async testPaymentIntents() {
    console.log("\n💳 Testing Payment Intents...");

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1000,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: { test: "true" },
      });

      this.logTest("Payment Intent Creation", true, null, {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret ? "present" : "missing",
      });

      await stripe.paymentIntents.cancel(paymentIntent.id);
      this.logTest("Payment Intent Cleanup", true);
    } catch (error) {
      this.logTest("Payment Intent Creation", false, error.message);
    }
  }

  async testWebhookEndpoints() {
    console.log("\n🔔 Testing Webhook Endpoints...");

    try {
      const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 5 });
      this.logTest("Webhook Endpoints List", true, null, {
        count: webhookEndpoints.data.length,
        endpoints: webhookEndpoints.data.map((ep) => ({
          id: ep.id,
          url: ep.url,
          status: ep.status,
        })),
      });
    } catch (error) {
      this.logTest("Webhook Endpoints List", false, error.message);
    }
  }

  async testApiVersionCompatibility() {
    console.log("\n🔧 Testing API Version Compatibility...");

    try {
      const events = await stripe.events.list({ limit: 1 });
      this.logTest("Events API (Version Compatibility)", true, null, {
        apiVersion: "2025-02-24.acacia",
        eventsCount: events.data.length,
      });
    } catch (error) {
      this.logTest("Events API (Version Compatibility)", false, error.message);
    }
  }

  printSummary() {
    console.log("\n📊 TEST SUMMARY");
    console.log("================");

    const successful = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log("\n❌ FAILED TESTS:");
      this.results
        .filter((r) => !r.success)
        .forEach((r) => console.log(`   • ${r.test}: ${r.error}`));
    }

    console.log("\n🎯 API Version: 2025-02-24.acacia");
    console.log("🔗 Stripe Dashboard: https://dashboard.stripe.com/");
  }

  async runAllTests() {
    console.log("🚀 Starting Stripe API Tests...");
    console.log(`📅 API Version: 2025-02-24.acacia`);
    console.log(
      `🔑 Using Secret Key: ${process.env.STRIPE_SECRET_KEY ? "Present" : "Missing"}`
    );

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log(
        "❌ Error: STRIPE_SECRET_KEY not found in environment variables"
      );
      return;
    }

    await this.testBasicConnectivity();
    await this.testCustomerOperations();
    await this.testPriceAndProductOperations();
    await this.testCheckoutSession();
    await this.testWebhookEndpoints();
    await this.testPaymentIntents();
    await this.testApiVersionCompatibility();

    this.printSummary();
  }
}

// Run the tests
const tester = new StripeAPITester();
tester.runAllTests().catch((error) => {
  console.error("❌ Fatal error running tests:", error);
  process.exit(1);
});
