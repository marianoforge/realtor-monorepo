import { db } from "@/lib/firebaseAdmin";

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp in milliseconds
  scope: string;
  token_type: "Bearer";
}

export interface GoogleCalendarSettings {
  defaultCalendarId: string;
  syncEnabled: boolean;
  lastSyncAt?: number;
}

/**
 * Refreshes Google access token using refresh token
 */
export async function refreshAccessToken(refresh_token: string): Promise<{
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  scope: string;
}> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  return res.json();
}

/**
 * Saves Google tokens to Firestore for a user
 */
export async function saveGoogleTokens(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: "Bearer";
  }
): Promise<void> {
  const tokenData: Partial<GoogleTokens> = {
    access_token: tokens.access_token,
    expires_at: Date.now() + tokens.expires_in * 1000,
    scope: tokens.scope,
    token_type: tokens.token_type,
  };

  // Only update refresh_token if provided (it's only given on first authorization)
  if (tokens.refresh_token) {
    tokenData.refresh_token = tokens.refresh_token;
  }

  // Use set with merge to create document if it doesn't exist, or update if it does
  await db.collection("usuarios").doc(userId).set(
    {
      googleAuth: tokenData,
    },
    { merge: true }
  );
}

/**
 * Gets Google tokens for a user from Firestore
 */
export async function getUserGoogleTokens(
  userId: string
): Promise<GoogleTokens | null> {
  const userDoc = await db.collection("usuarios").doc(userId).get();
  const userData = userDoc.data();

  return userData?.googleAuth || null;
}

/**
 * Gets a valid access token for a user, refreshing if necessary
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const tokens = await getUserGoogleTokens(userId);

  if (!tokens) {
    throw new Error("User has not connected Google Calendar");
  }

  // Check if token is expired (with 5 minute buffer)
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  if (Date.now() + bufferTime >= tokens.expires_at) {
    // Token is expired or about to expire, refresh it
    const refreshed = await refreshAccessToken(tokens.refresh_token);

    // Save the new token
    await saveGoogleTokens(userId, refreshed);

    return refreshed.access_token;
  }

  return tokens.access_token;
}

/**
 * Checks if user has Google Calendar connected
 */
export async function isGoogleCalendarConnected(
  userId: string
): Promise<boolean> {
  const tokens = await getUserGoogleTokens(userId);
  return tokens !== null && !!tokens.refresh_token;
}

/**
 * Removes Google tokens for a user (disconnect)
 */
export async function disconnectGoogleCalendar(userId: string): Promise<void> {
  await db.collection("usuarios").doc(userId).set(
    {
      googleAuth: null,
      googleCalendarSettings: null,
    },
    { merge: true }
  );
}

/**
 * Saves Google Calendar settings for a user
 */
export async function saveGoogleCalendarSettings(
  userId: string,
  settings: GoogleCalendarSettings
): Promise<void> {
  await db.collection("usuarios").doc(userId).set(
    {
      googleCalendarSettings: settings,
    },
    { merge: true }
  );
}

/**
 * Gets Google Calendar settings for a user
 */
export async function getUserGoogleCalendarSettings(
  userId: string
): Promise<GoogleCalendarSettings | null> {
  const userDoc = await db.collection("usuarios").doc(userId).get();
  const userData = userDoc.data();

  return userData?.googleCalendarSettings || null;
}
