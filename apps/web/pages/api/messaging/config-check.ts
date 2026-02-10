import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if all required Firebase environment variables are present
  const requiredEnvVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  const config = {
    allConfigured: missingVars.length === 0,
    missingVariables: missingVars,
    availableVariables: Object.keys(requiredEnvVars).filter(
      (key) => requiredEnvVars[key as keyof typeof requiredEnvVars]
    ),
    firebaseConfig: {
      apiKey: requiredEnvVars.NEXT_PUBLIC_FIREBASE_API_KEY
        ? "✅ Configured"
        : "❌ Missing",
      authDomain: requiredEnvVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? "✅ Configured"
        : "❌ Missing",
      projectId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? "✅ Configured"
        : "❌ Missing",
      storageBucket: requiredEnvVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
        ? "✅ Configured"
        : "❌ Missing",
      messagingSenderId:
        requiredEnvVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
          ? "✅ Configured"
          : "❌ Missing",
      appId: requiredEnvVars.NEXT_PUBLIC_FIREBASE_APP_ID
        ? "✅ Configured"
        : "❌ Missing",
    },
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      ? "✅ Configured"
      : "⚠️ Using default",
  };

  return res.status(200).json(config);
}
