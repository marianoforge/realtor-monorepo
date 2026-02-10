import type { NextApiRequest, NextApiResponse } from "next";
import { diagnosisFirebaseAdmin } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const diagnosis = diagnosisFirebaseAdmin();

    return res.status(200).json({
      status: diagnosis.issues.length === 0 ? "OK" : "ERROR",
      timestamp: new Date().toISOString(),
      diagnosis,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      },
    });
  } catch (error) {
    console.error("❌ Error in diagnosis API:", error);
    return res.status(500).json({
      status: "CRITICAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
