import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { db } from "@/lib/firebaseAdmin";
import { PRICE_ID_GROWTH, PRICE_ID_GROWTH_ANNUAL } from "@/lib/data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let event;
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("No Stripe signature found in request headers");
    return res.status(400).json({ error: "No Stripe signature found" });
  }

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle both string and expanded customer object
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : (subscription.customer as Stripe.Customer).id;
      const subscriptionId = subscription.id;

      try {
        if (!customerId) {
          return res.status(200).json({
            received: true,
            status: "no_customer_id",
          });
        }

        const userQuery = db
          .collection("usuarios")
          .where("stripeCustomerId", "==", customerId);
        const snapshot = await userQuery.get();

        if (snapshot.empty) {
          return res
            .status(200)
            .json({ received: true, status: "no_user_found" });
        }

        await Promise.all(
          snapshot.docs.map(async (doc) => {
            const userData = doc.data();
            const updateData: any = {
              subscriptionStatus: "canceled",
              subscriptionCanceledAt: new Date().toISOString(),
            };

            if (!userData.stripeSubscriptionId) {
              updateData.stripeSubscriptionId = subscriptionId;
            }

            await doc.ref.update(updateData);
          })
        );
      } catch (error) {
        console.error("Error updating Firestore:", error);
        return res.status(200).json({
          received: true,
          status: "error_updating_firestore",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : (subscription.customer as Stripe.Customer).id;
      const subscriptionId = subscription.id;
      const status = subscription.status;

      try {
        if (!customerId) {
          return res.status(200).json({
            received: true,
            status: "no_customer_id",
          });
        }

        const userQuery = db
          .collection("usuarios")
          .where("stripeCustomerId", "==", customerId);
        const snapshot = await userQuery.get();

        if (!snapshot.empty) {
          await Promise.all(
            snapshot.docs.map(async (doc) => {
              const userData = doc.data();
              const updateData: any = {
                subscriptionStatus: status,
              };

              if (!userData.stripeSubscriptionId) {
                updateData.stripeSubscriptionId = subscriptionId;
              }

              if (subscription.trial_start && subscription.trial_end) {
                updateData.trialStartDate = new Date(
                  subscription.trial_start * 1000
                ).toISOString();
                updateData.trialEndDate = new Date(
                  subscription.trial_end * 1000
                ).toISOString();
              }

              if (
                subscription.current_period_start &&
                subscription.current_period_end
              ) {
                updateData.currentPeriodStart = new Date(
                  subscription.current_period_start * 1000
                ).toISOString();
                updateData.currentPeriodEnd = new Date(
                  subscription.current_period_end * 1000
                ).toISOString();
              }

              if (status === "canceled") {
                updateData.subscriptionCanceledAt = new Date().toISOString();
              }

              await doc.ref.update(updateData);
            })
          );
        } else {
          return res.status(200).json({
            received: true,
            status: "no_user_found",
            customerId,
          });
        }
      } catch (error) {
        console.error("Error updating subscription status:", error);
        return res.status(200).json({
          received: true,
          status: "error_updating_subscription",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      const userIdFromMetadata = session.metadata?.userId;
      const fromTrial = session.metadata?.fromTrial === "true";
      const fromRegistration = session.metadata?.fromRegistration === "true";
      let customerEmail: string | undefined =
        session.customer_details?.email ?? session.customer_email;
      if (!customerEmail && customerId) {
        try {
          const customer = await stripe.customers.retrieve(
            customerId as string
          );
          if (!customer.deleted && "email" in customer && customer.email) {
            customerEmail = customer.email;
          }
        } catch {
          // ignore
        }
      }

      console.log("[webhook] checkout.session.completed:", {
        customerId,
        subscriptionId,
        userIdFromMetadata,
        fromTrial,
        fromRegistration,
        customerEmail,
        paymentStatus: session.payment_status,
        mode: session.mode,
      });

      const resolveRole = async (
        subId: string | undefined
      ): Promise<string | undefined> => {
        if (!subId) return undefined;
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items?.data?.[0]?.price?.id;
          if (
            priceId === PRICE_ID_GROWTH ||
            priceId === PRICE_ID_GROWTH_ANNUAL
          ) {
            return "team_leader_broker";
          }
          if (priceId) return "agente_asesor";
        } catch {
          // ignore
        }
        return undefined;
      };

      const resolveSubscriptionStatus = async (
        subId: string | undefined
      ): Promise<string> => {
        if (!subId) return "active";
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          return sub.status;
        } catch {
          return "active";
        }
      };

      try {
        if (fromRegistration && userIdFromMetadata) {
          const userRef = db.collection("usuarios").doc(userIdFromMetadata);
          const userDoc = await userRef.get();

          if (userDoc.exists) {
            const subscriptionStatus =
              await resolveSubscriptionStatus(subscriptionId);
            const role = await resolveRole(subscriptionId);

            const updateData: any = {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId ?? null,
              subscriptionStatus,
              registrationCheckoutCompletedAt: new Date().toISOString(),
            };

            if (role) updateData.role = role;
            await userRef.update(updateData);
            console.log(
              "[webhook] Updated user (fromRegistration):",
              userIdFromMetadata
            );
          }
        } else if (fromTrial && userIdFromMetadata) {
          const userRef = db.collection("usuarios").doc(userIdFromMetadata);

          const role = await resolveRole(subscriptionId);
          const updateData: any = {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId ?? null,
            subscriptionStatus: "active",
            trialConvertedAt: new Date().toISOString(),
          };

          if (role) updateData.role = role;
          await userRef.update(updateData);
          console.log(
            "[webhook] Updated user (fromTrial):",
            userIdFromMetadata
          );
        } else if (customerId) {
          const updateMatchedDocs = async (
            docs: FirebaseFirestore.QueryDocumentSnapshot[],
            matchType: string
          ) => {
            await Promise.all(
              docs.map(async (doc) => {
                const userData = doc.data();
                const subscriptionStatus = subscriptionId
                  ? await resolveSubscriptionStatus(subscriptionId)
                  : "active";
                const role = await resolveRole(subscriptionId);

                const updateData: any = {
                  stripeCustomerId: customerId,
                  subscriptionStatus,
                };
                if (subscriptionId)
                  updateData.stripeSubscriptionId = subscriptionId;
                if (role) updateData.role = role;
                if (
                  userData.subscriptionStatus === "trialing" ||
                  userData.subscriptionStatus === "pending_payment"
                ) {
                  updateData.trialConvertedAt = new Date().toISOString();
                }

                await doc.ref.update(updateData);
                console.log(`[webhook] Updated user (${matchType}):`, doc.id);
              })
            );
          };

          let matched = false;

          if (customerEmail) {
            const emailSnap = await db
              .collection("usuarios")
              .where("email", "==", customerEmail)
              .get();
            if (!emailSnap.empty) {
              await updateMatchedDocs(emailSnap.docs, "email");
              matched = true;
            } else {
              const lowerEmail = customerEmail.toLowerCase();
              if (lowerEmail !== customerEmail) {
                const lowerSnap = await db
                  .collection("usuarios")
                  .where("email", "==", lowerEmail)
                  .get();
                if (!lowerSnap.empty) {
                  await updateMatchedDocs(lowerSnap.docs, "email-lowercase");
                  matched = true;
                }
              }
            }
          }

          if (!matched && session.id) {
            const sessionSnap = await db
              .collection("usuarios")
              .where("sessionId", "==", session.id)
              .get();
            if (!sessionSnap.empty) {
              await updateMatchedDocs(sessionSnap.docs, "sessionId");
              matched = true;
            }
          }

          if (!matched) {
            console.warn(
              "[webhook] checkout.session.completed: no user found",
              { customerEmail, sessionId: session.id }
            );
          }
        } else {
          console.warn("[webhook] checkout.session.completed: no match", {
            hasCustomerId: !!customerId,
            hasSubscriptionId: !!subscriptionId,
            hasEmail: !!customerEmail,
            hasMetadata: !!userIdFromMetadata,
          });
        }
      } catch (error) {
        console.error("[webhook] Error processing checkout completion:", error);
        return res.status(200).json({
          received: true,
          status: "error_processing_checkout",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : (subscription.customer as Stripe.Customer).id;
      const subscriptionId = subscription.id;
      const status = subscription.status;

      try {
        if (!customerId) {
          return res.status(200).json({
            received: true,
            status: "no_customer_id",
          });
        }

        const priceId = subscription.items?.data?.[0]?.price?.id;
        let role: string | undefined = undefined;

        if (priceId === PRICE_ID_GROWTH || priceId === PRICE_ID_GROWTH_ANNUAL) {
          role = "team_leader_broker";
        } else if (priceId) {
          role = "agente_asesor";
        }

        const userQuery = db
          .collection("usuarios")
          .where("stripeCustomerId", "==", customerId);
        const snapshot = await userQuery.get();

        if (!snapshot.empty) {
          await Promise.all(
            snapshot.docs.map(async (doc) => {
              const userData = doc.data();
              const updateData: any = {
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: status === "active" ? "active" : status,
              };

              if (role) {
                updateData.role = role;
              }

              if (userData.subscriptionStatus === "trialing") {
                updateData.trialConvertedAt = new Date().toISOString();
              }

              await doc.ref.update(updateData);
            })
          );
        }
      } catch (error) {
        console.error("Error processing subscription creation:", error);
        return res.status(200).json({
          received: true,
          status: "error_processing_subscription_creation",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return res.status(200).json({
      received: true,
      status: "success",
      type: event.type,
    });
  } catch (err: any) {
    console.error("Webhook error:", {
      message: err.message,
      stack: err.stack,
      type: err.type,
    });

    if (err.type === "StripeSignatureVerificationError") {
      console.error("Stripe signature verification failed");
      return res.status(400).json({
        error: "Webhook signature verification failed",
        message: err.message,
      });
    }

    console.error("Webhook processing error:", err.message);
    return res.status(200).json({
      received: true,
      status: "error",
      error: err.message,
      type: err.type || "unknown",
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
