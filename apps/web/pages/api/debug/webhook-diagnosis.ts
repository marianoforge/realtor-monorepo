import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { adminAuth, db } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

interface DiagnosisResult {
  userExists: boolean;
  userData?: any;
  stripeCustomer?: any;
  stripeSubscription?: any;
  issues: string[];
  recommendations: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate Firebase authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { userEmail, userId, stripeCustomerId, stripeSubscriptionId } =
      req.body;

    if (!userEmail && !userId) {
      return res.status(400).json({
        error: "Either userEmail or userId is required",
      });
    }

    const diagnosis: DiagnosisResult = {
      userExists: false,
      issues: [],
      recommendations: [],
    };

    // 1. Check if user exists in Firestore
    let userQuery;
    if (userId) {
      userQuery = db.collection("usuarios").doc(userId);
      const userSnap = await userQuery.get();

      if (userSnap.exists) {
        diagnosis.userExists = true;
        diagnosis.userData = userSnap.data();
      }
    } else {
      userQuery = db.collection("usuarios").where("email", "==", userEmail);
      const snapshot = await userQuery.get();

      if (!snapshot.empty) {
        diagnosis.userExists = true;
        diagnosis.userData = snapshot.docs[0].data();
      }
    }

    if (!diagnosis.userExists) {
      diagnosis.issues.push("User not found in Firestore database");
      diagnosis.recommendations.push("Verify user email/ID is correct");
      return res.status(200).json(diagnosis);
    }

    const userData = diagnosis.userData;

    // 2. Check Stripe customer
    if (userData.stripeCustomerId || stripeCustomerId) {
      try {
        const customerId = stripeCustomerId || userData.stripeCustomerId;
        diagnosis.stripeCustomer = await stripe.customers.retrieve(customerId);
      } catch (error: any) {
        diagnosis.issues.push(`Stripe customer not found: ${error.message}`);
        diagnosis.recommendations.push(
          "Customer may have been deleted from Stripe"
        );
      }
    } else {
      diagnosis.issues.push("No stripeCustomerId found in user data");
      diagnosis.recommendations.push(
        "User needs to complete checkout to create Stripe customer"
      );
    }

    // 3. Check Stripe subscription
    if (userData.stripeSubscriptionId || stripeSubscriptionId) {
      try {
        const subscriptionId =
          stripeSubscriptionId || userData.stripeSubscriptionId;
        if (subscriptionId !== "trial") {
          diagnosis.stripeSubscription =
            await stripe.subscriptions.retrieve(subscriptionId);
        } else {
          diagnosis.issues.push(
            "User is still in trial mode (stripeSubscriptionId = 'trial')"
          );
          diagnosis.recommendations.push(
            "User needs to complete payment to convert from trial"
          );
        }
      } catch (error: any) {
        diagnosis.issues.push(
          `Stripe subscription not found: ${error.message}`
        );
        diagnosis.recommendations.push(
          "Subscription may have been canceled or deleted"
        );
      }
    } else {
      diagnosis.issues.push("No stripeSubscriptionId found in user data");
      diagnosis.recommendations.push(
        "Subscription was never created or webhook failed"
      );
    }

    // 4. Data consistency checks
    if (
      userData.subscriptionStatus === "trialing" &&
      userData.stripeSubscriptionId !== "trial"
    ) {
      diagnosis.issues.push(
        "Inconsistent trial state: subscriptionStatus is 'trialing' but stripeSubscriptionId is not 'trial'"
      );
      diagnosis.recommendations.push("Run data correction to fix trial state");
    }

    if (
      userData.subscriptionStatus === "active" &&
      !userData.stripeSubscriptionId
    ) {
      diagnosis.issues.push(
        "Inconsistent active state: subscriptionStatus is 'active' but no stripeSubscriptionId"
      );
      diagnosis.recommendations.push(
        "User status should be corrected or subscription ID added"
      );
    }

    if (userData.stripeCustomerId && !userData.stripeSubscriptionId) {
      diagnosis.issues.push(
        "Customer exists but no subscription: stripeCustomerId exists but stripeSubscriptionId is missing"
      );
      diagnosis.recommendations.push(
        "Check if subscription creation failed or webhook was missed"
      );
    }

    // 5. Webhook delivery recommendations
    if (diagnosis.issues.length > 0) {
      diagnosis.recommendations.push(
        "Check Stripe webhook logs for failed deliveries",
        "Verify webhook endpoint is correctly configured",
        "Test webhook endpoint manually with Stripe CLI"
      );
    }

    return res.status(200).json(diagnosis);
  } catch (error: any) {
    console.error("❌ Error in webhook diagnosis:", error);
    return res.status(500).json({
      error: "Diagnosis failed",
      message: error.message,
    });
  }
}
