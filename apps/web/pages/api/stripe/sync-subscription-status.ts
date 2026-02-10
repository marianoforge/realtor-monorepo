import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { db } from "@/lib/firebaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { customerId, subscriptionId, email } = req.body;

    let usersToUpdate: any[] = [];

    if (customerId) {
      const userQuery = db
        .collection("usuarios")
        .where("stripeCustomerId", "==", customerId);
      const snapshot = await userQuery.get();

      if (!snapshot.empty) {
        usersToUpdate = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      }
    } else if (email) {
      const userQuery = db.collection("usuarios").where("email", "==", email);
      const snapshot = await userQuery.get();

      if (!snapshot.empty) {
        usersToUpdate = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
      }
    } else {
      const allUsersQuery = db
        .collection("usuarios")
        .where("stripeCustomerId", "!=", null);
      const snapshot = await allUsersQuery.get();

      usersToUpdate = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
    }

    if (usersToUpdate.length === 0) {
      return res.status(404).json({
        message: "No users found to update",
        updated: 0,
      });
    }

    const updateResults = [];

    for (const user of usersToUpdate) {
      const userData = user.data;
      try {
        const userCustomerId = userData.stripeCustomerId;

        if (!userCustomerId) {
          continue;
        }

        const subscriptions = await stripe.subscriptions.list({
          customer: userCustomerId,
          limit: 10,
        });

        if (subscriptions.data.length === 0) {
          continue;
        }

        const latestSubscription = subscriptions.data[0];
        const updateData: any = {
          subscriptionStatus: latestSubscription.status,
          lastSyncAt: new Date().toISOString(),
        };

        if (!userData.stripeSubscriptionId) {
          updateData.stripeSubscriptionId = latestSubscription.id;
        }

        if (latestSubscription.status === "canceled") {
          updateData.subscriptionStatus = "canceled";
          if (!userData.subscriptionCanceledAt) {
            updateData.subscriptionCanceledAt = new Date().toISOString();
          }
        }

        await db.collection("usuarios").doc(user.id).update(updateData);

        updateResults.push({
          userId: user.id,
          email: userData.email,
          customerId: userCustomerId,
          subscriptionId: latestSubscription.id,
          oldStatus: userData.subscriptionStatus,
          newStatus: latestSubscription.status,
          updated: true,
        });
      } catch (userError) {
        console.error(`Error updating user ${user.id}:`, userError);
        updateResults.push({
          userId: user.id,
          email: userData.email,
          error:
            userError instanceof Error ? userError.message : "Unknown error",
          updated: false,
        });
      }
    }

    const successCount = updateResults.filter((r) => r.updated).length;
    const errorCount = updateResults.filter((r) => !r.updated).length;

    return res.status(200).json({
      message: "Subscription status sync completed",
      totalProcessed: updateResults.length,
      successCount,
      errorCount,
      results: updateResults,
    });
  } catch (error) {
    console.error("Error syncing subscription status:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
