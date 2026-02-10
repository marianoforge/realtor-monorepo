/**
 * This script helps set up a cron job for recurring expenses.
 * You can run it on your server or use a cloud service like AWS Lambda, Google Cloud Functions, or Vercel Cron Jobs.
 *
 * For Vercel Cron Jobs, add this to your vercel.json:
 *
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/process-recurring-expenses",
 *       "schedule": "0 0 1 * *"  // Run at midnight on the 1st of every month
 *     }
 *   ]
 * }
 *
 * For a traditional server, you can set up a cron job with:
 * 0 0 1 * * curl -X POST -H "X-API-Key: YOUR_API_KEY" https://your-domain.com/api/cron/process-recurring-expenses
 *
 * Make sure to set CRON_API_KEY in your environment variables.
 */

// Main script for testing the recurring expenses endpoint
// Run with: npx ts-node scripts/setup-cron-job.ts
import * as path from "path";

import * as dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "..", ".env.local") });

async function main() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const API_URL = `${BASE_URL}/api/cron/process-recurring-expenses`;
  const API_KEY = process.env.CRON_API_KEY;

  if (!API_KEY) {
    console.error("❌ Error: CRON_API_KEY environment variable is not set!");
    process.exit(1);
  }

  console.log(`🔹 Testing recurring expenses processing at ${API_URL}...`);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Test successful! Response:", data);
    } else {
      console.error("❌ Test failed! Response:", data);
    }
  } catch (error) {
    console.error("❌ Error testing recurring expenses:", error);
  }
}

// Execute the main function
main().catch(console.error);
