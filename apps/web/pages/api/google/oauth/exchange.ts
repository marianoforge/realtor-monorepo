import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { saveGoogleTokens } from "@/lib/googleTokens";

/**
 * Exchanges authorization code for Google OAuth tokens
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { code, redirect_uri } = req.body as {
      code: string;
      redirect_uri: string;
    };

    if (!code || !redirect_uri) {
      return res.status(400).json({
        message: "Missing required fields: code and redirect_uri",
      });
    }

    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return res.status(400).json({
        message: "Failed to exchange authorization code",
        error: errorText,
      });
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: "Bearer";
      scope: string;
    };

    // Ensure we have a refresh token (needed for offline access)
    if (!tokens.refresh_token) {
      return res.status(400).json({
        message: "No refresh token received. Please re-authorize with consent.",
      });
    }

    // Save tokens to Firestore
    await saveGoogleTokens(userId, tokens);

    return res.json({
      success: true,
      message: "Google Calendar conectado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
