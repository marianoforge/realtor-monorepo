import type { NextApiRequest, NextApiResponse } from "next";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { db } from "@/lib/firebaseAdmin";
import { safeToDate } from "@/common/utils/firestoreUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Solo permitir peticiones POST para esta operación
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const apiKey = req.headers["x-api-key"];
    if (!process.env.CRON_API_KEY || apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({
        message: "Unauthorized access",
        hint: "Add CRON_API_KEY environment variable in .env.local and Vercel project settings",
      });
    }

    const mailersendApiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const trialReminderTemplateId = "ynrw7gyq9xk42k8e";

    if (!mailersendApiKey || !fromEmail || !fromName || !baseUrl) {
      console.error("Faltan variables de entorno para MailerSend.");
      return res.status(500).json({
        message: "MailerSend environment variables are missing",
        required: [
          "MAILERSEND_API_KEY",
          "MAILERSEND_FROM_EMAIL",
          "MAILERSEND_FROM_NAME",
          "NEXT_PUBLIC_BASE_URL",
        ],
      });
    }

    const mailerSend = new MailerSend({ apiKey: mailersendApiKey });

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startRange = new Date(threeDaysFromNow.getTime() - 60 * 60 * 1000);
    const endRange = new Date(threeDaysFromNow.getTime() + 60 * 60 * 1000);

    const usersSnapshot = await db
      .collection("usuarios")
      .where("stripeSubscriptionId", "==", "trial")
      .where("trialEndDate", ">=", startRange)
      .where("trialEndDate", "<=", endRange)
      .get();

    if (usersSnapshot.empty) {
      return res.status(200).json({
        message: "No users with trial expiring in 3 days",
        sentCount: 0,
      });
    }

    const sentEmails = [];
    const failedEmails = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      const email = userData.email;
      const firstName = userData.firstName;
      const lastName = userData.lastName;
      const trialEndDate = safeToDate(userData.trialEndDate);
      const trialReminderSent = userData.trialReminderSent || false;

      // Verificar si ya se envió el recordatorio
      if (trialReminderSent) {
        continue;
      }

      try {
        const sentFrom = new Sender(fromEmail, fromName);
        const recipients = [new Recipient(email, `${firstName} ${lastName}`)];

        const daysRemaining = Math.ceil(
          (trialEndDate!.getTime() - now.getTime()) / (1000 * 3600 * 24)
        );

        const personalization = [
          {
            email,
            data: {
              account: {
                name: "Realtor Trackpro",
              },
              first_name: firstName || "Usuario",
              payment_url: `${baseUrl}/dashboard?show_payment=true`,
              dashboard_url: `${baseUrl}/dashboard`,
              support_email: "info@realtortrackpro.com",
              days_remaining: daysRemaining.toString(),
              trial_end_date: trialEndDate!.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          },
        ];

        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("⏰ Tu trial de Realtor Trackpro expira pronto")
          .setTemplateId(trialReminderTemplateId)
          .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);

        await db.collection("usuarios").doc(userId).update({
          trialReminderSent: true,
          trialReminderSentAt: new Date().toISOString(),
        });

        sentEmails.push({
          userId,
          email,
          trialEndDate: trialEndDate?.toISOString(),
          daysRemaining,
        });
      } catch (error) {
        console.error(`Error enviando recordatorio a ${email}:`, error);
        failedEmails.push({
          userId,
          email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return res.status(200).json({
      message: "Trial reminder emails processed successfully",
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
      sentEmails: sentEmails.map((u) => ({
        email: u.email,
        trialEndDate: u.trialEndDate,
        daysRemaining: u.daysRemaining,
      })),
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
    });
  } catch (error) {
    console.error("Error en cron job de recordatorio de trial:", error);
    return res.status(500).json({
      message: "Error processing trial reminder emails",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
