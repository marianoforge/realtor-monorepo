import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getValidAccessToken } from "@/lib/googleTokens";

interface DeleteEventRequest {
  calendarId?: string;
  googleEventId: string;
}

async function deleteGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Calendar API error: ${response.status} - ${errorText}`
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
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

    const { calendarId = "primary", googleEventId } =
      req.body as DeleteEventRequest;

    if (!googleEventId) {
      return res.status(400).json({
        message: "Missing required field: googleEventId",
      });
    }

    const accessToken = await getValidAccessToken(userId);

    await deleteGoogleCalendarEvent(accessToken, calendarId, googleEventId);

    return res.json({
      success: true,
      message: "Event deleted from Google Calendar",
    });
  } catch (error) {
    console.error("Error eliminando evento de Google Calendar:", error);

    if (
      error instanceof Error &&
      error.message.includes("User has not connected")
    ) {
      return res.status(403).json({
        message: "Google Calendar not connected",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to delete Google Calendar event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
