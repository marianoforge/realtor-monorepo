# Stripe API Test Script

This script tests the new Stripe API version `2025-02-24.acacia` to ensure all integrations work correctly after the update.

## Prerequisites

1. **Environment Variables**: Ensure your `.env.local` file contains:

   ```
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Dependencies**: Install required dependencies:
   ```bash
   yarn install
   ```

## Running the Tests

Execute the test script using:

```bash
yarn test:stripe
```

Or directly with:

```bash
npx ts-node scripts/test-stripe-api.ts
```

## What the Script Tests

### 🔗 Basic Connectivity

- Tests connection to Stripe API
- Retrieves account information
- Validates API key authentication

### 👤 Customer Operations

- Creates test customers
- Retrieves customer data
- Tests customer deletion (cleanup)

### 💰 Product & Price Operations

- Creates test products
- Creates recurring prices
- Tests product deactivation

### 🛒 Checkout Sessions

- Creates payment checkout sessions
- Tests one-time payment flows
- Validates session URLs

### 📅 Subscription Operations

- Creates test subscriptions
- Tests subscription lifecycle
- Validates subscription statuses

### 🔔 Webhook Endpoints

- Lists existing webhook endpoints
- Tests webhook configuration access

### 💳 Payment Intents

- Creates payment intents
- Tests payment flow initialization
- Validates client secrets

### 🔧 API Version Compatibility

- Tests events API with new version
- Ensures backward compatibility

## Test Results

The script provides:

- ✅ Real-time test status
- 📊 Comprehensive summary
- ❌ Detailed error reporting
- 🎯 API version confirmation

## Safety Features

- **Automatic Cleanup**: All test data is automatically removed
- **Test Metadata**: All created objects are marked with `{ test: 'true' }`
- **No Real Charges**: Uses test mode only
- **Error Handling**: Graceful failure with cleanup

## Expected Output

```
🚀 Starting Stripe API Tests...
📅 API Version: 2025-02-24.acacia
🔑 Using Secret Key: Present

🔗 Testing Basic Stripe Connectivity...
✅ Basic API Connection

👤 Testing Customer Operations...
✅ Customer Creation
✅ Customer Retrieval
✅ Customer Cleanup

... (more tests)

📊 TEST SUMMARY
================
Total Tests: 15
✅ Successful: 15
❌ Failed: 0
Success Rate: 100.0%

🎯 API Version: 2025-02-24.acacia
🔗 Stripe Dashboard: https://dashboard.stripe.com/
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```
   ❌ Error: STRIPE_SECRET_KEY not found in environment variables
   ```

   **Solution**: Add your Stripe secret key to `.env.local`

2. **API Key Permissions**

   ```
   ❌ Basic API Connection: Invalid API key provided
   ```

   **Solution**: Verify your Stripe secret key is correct and has proper permissions

3. **Network Issues**
   ```
   ❌ Connection timeout
   ```
   **Solution**: Check your internet connection and Stripe service status

### Getting Help

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Stripe API Docs**: https://docs.stripe.com/api
- **API Changelog**: https://docs.stripe.com/upgrades#api-changelog

## Integration Points Tested

This script validates all Stripe integrations in your application:

- `/api/auth/verifyEmail.ts`
- `/api/checkout/[session_id].ts`
- `/api/checkout/checkout_session.ts`
- `/api/stripe/cancel_subscription.ts`
- `/api/stripe/create-post-trial-session.ts`
- `/api/stripe/customer_info.ts`
- `/api/stripe/subscription_info.ts`
- `/api/stripe/subscription_status.ts`
- `/api/stripe/webhook/route.ts`

## Notes

- **Test Mode Only**: This script only works with test API keys
- **No Production Impact**: All operations are performed in Stripe's test environment
- **Clean Execution**: All test objects are automatically cleaned up
- **Version Specific**: Tests the exact API version used in your application

Run this script after any Stripe API version updates to ensure compatibility!
