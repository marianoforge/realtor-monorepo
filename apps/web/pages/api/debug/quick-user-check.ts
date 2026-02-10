import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const userEmail = "grupoforte.inmobiliaria@gmail.com";
    const expectedUserId = "fyDdeFgb27ghc5KEyzSb6v4KtVs1";
    const expectedData = {
      stripeSubscriptionId: "sub_1S4kXhLhJiHtNGWd0Sa0Cvxz",
      stripeCustomerId: "cus_T0m5FAbdDj2VDm",
    };

    const userQuery = db.collection("usuarios").where("email", "==", userEmail);
    const snapshot = await userQuery.get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: "User not found",
        email: userEmail,
      });
    }

    const userDoc = snapshot.docs[0];
    const foundUserId = userDoc.id;
    const userData = userDoc.data();

    // Check current state
    const currentState = {
      foundUserId,
      email: userData.email,
      stripeCustomerId: userData.stripeCustomerId || null,
      stripeSubscriptionId: userData.stripeSubscriptionId || null,
      subscriptionStatus: userData.subscriptionStatus || null,
      trialConvertedAt: userData.trialConvertedAt || null,
    };

    // Analyze what needs fixing
    const analysis = {
      uidMatches: foundUserId === expectedUserId,
      hasStripeCustomerId: !!userData.stripeCustomerId,
      hasStripeSubscriptionId:
        !!userData.stripeSubscriptionId &&
        userData.stripeSubscriptionId !== "trial",
      subscriptionIsActive: userData.subscriptionStatus === "active",
      correctStripeCustomerId:
        userData.stripeCustomerId === expectedData.stripeCustomerId,
      correctStripeSubscriptionId:
        userData.stripeSubscriptionId === expectedData.stripeSubscriptionId,
    };

    const needsFix = {
      stripeCustomerId: !analysis.correctStripeCustomerId,
      stripeSubscriptionId: !analysis.correctStripeSubscriptionId,
      subscriptionStatus: !analysis.subscriptionIsActive,
    };

    const hasAnyIssues = Object.values(needsFix).some(Boolean);

    return res.status(200).json({
      timestamp: new Date().toISOString(),
      userEmail,
      expectedUserId,
      currentState,
      analysis,
      needsFix,
      hasAnyIssues,
      summary: hasAnyIssues ? "User needs fixing" : "User data is correct",
      expectedData,
    });
  } catch (error: any) {
    console.error("Error during quick check:", error);
    return res.status(500).json({
      error: "Check failed",
      message: error.message,
    });
  }
}
