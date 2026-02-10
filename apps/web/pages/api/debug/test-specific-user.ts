import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, db } from "@/lib/firebaseAdmin";

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

    const userEmail = "grupoforte.inmobiliaria@gmail.com";
    const expectedUserId = "fyDdeFgb27ghc5KEyzSb6v4KtVs1";
    const expectedData = {
      stripeSubscriptionId: "sub_1S4kXhLhJiHtNGWd0Sa0Cvxz",
      stripeCustomerId: "cus_T0m5FAbdDj2VDm",
    };

    const result = {
      step: "",
      user: null as any,
      analysis: {} as any,
      updateApplied: false,
      finalVerification: {} as any,
      logs: [] as string[],
    };

    result.step = "Finding user";

    const userQuery = db.collection("usuarios").where("email", "==", userEmail);
    const snapshot = await userQuery.get();

    if (snapshot.empty) {
      return res.status(404).json({ ...result, error: "User not found" });
    }

    const userDoc = snapshot.docs[0];
    const foundUserId = userDoc.id;
    const userData = userDoc.data();

    result.user = {
      foundUserId,
      expectedUserId,
      uidMatch: foundUserId === expectedUserId,
      currentData: {
        stripeCustomerId: userData.stripeCustomerId || "NOT SET",
        stripeSubscriptionId: userData.stripeSubscriptionId || "NOT SET",
        subscriptionStatus: userData.subscriptionStatus || "NOT SET",
      },
    };

    result.step = "Analyzing data";

    const needsUpdate = {
      stripeCustomerId:
        userData.stripeCustomerId !== expectedData.stripeCustomerId,
      stripeSubscriptionId:
        userData.stripeSubscriptionId !== expectedData.stripeSubscriptionId,
      subscriptionStatus: userData.subscriptionStatus !== "active",
    };

    result.analysis = {
      needsUpdate,
      hasIssues: Object.values(needsUpdate).some(Boolean),
    };

    result.logs.push("=== ANALYSIS ===");
    result.logs.push("🔍 Fields that need updating:");
    Object.entries(needsUpdate).forEach(([field, needs]) => {
      result.logs.push(
        `  - ${field}: ${needs ? "❌ NEEDS UPDATE" : "✅ CORRECT"}`
      );
    });

    // 3. Apply fix if needed
    if (result.analysis.hasIssues) {
      result.step = "Applying fix";
      result.logs.push("=== APPLYING FIX ===");

      const updateData: any = {};

      if (needsUpdate.stripeCustomerId) {
        updateData.stripeCustomerId = expectedData.stripeCustomerId;
      }

      if (needsUpdate.stripeSubscriptionId) {
        updateData.stripeSubscriptionId = expectedData.stripeSubscriptionId;
      }

      if (needsUpdate.subscriptionStatus) {
        updateData.subscriptionStatus = "active";
      }

      if (
        userData.subscriptionStatus === "trialing" &&
        updateData.subscriptionStatus === "active"
      ) {
        updateData.trialConvertedAt = new Date().toISOString();
      }

      await userDoc.ref.update(updateData);
      result.updateApplied = true;

      result.step = "Verifying fix";
      const updatedSnap = await userDoc.ref.get();
      const updatedData = updatedSnap.data();

      result.finalVerification = {
        stripeCustomerId: updatedData?.stripeCustomerId,
        stripeSubscriptionId: updatedData?.stripeSubscriptionId,
        subscriptionStatus: updatedData?.subscriptionStatus,
        trialConvertedAt: updatedData?.trialConvertedAt,
      };

      const allCorrect =
        updatedData?.stripeCustomerId === expectedData.stripeCustomerId &&
        updatedData?.stripeSubscriptionId ===
          expectedData.stripeSubscriptionId &&
        updatedData?.subscriptionStatus === "active";

      result.finalVerification.allCorrect = allCorrect;
    }

    result.step = "Completed";
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error during test:", error);
    return res.status(500).json({
      error: "Test failed",
      message: error.message,
      step: "Error occurred",
    });
  }
}
