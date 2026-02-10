import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getValidAccessToken } from "@/lib/googleTokens";

interface UpdateEventRequest {
  calendarId?: string;
  googleEventId: string;
  patch: {
    summary?: string;
    description?: string;
    start?: {
      dateTime: string;
      timeZone?: string;
    };
    end?: {
      dateTime: string;
      timeZone?: string;
    };
    attendees?: Array<{ email: string }>;
    location?: string;
  };
}

async function updateGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string,
  patch: UpdateEventRequest["patch"]
): Promise<any> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Calendar API error: ${response.status} - ${errorText}`
    );
  }

  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
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

    const {
      calendarId = "primary",
      googleEventId,
      patch,
    } = req.body as UpdateEventRequest;

    if (!googleEventId || !patch) {
      return res.status(400).json({
        message: "Missing required fields: googleEventId, patch",
      });
    }

    const accessToken = await getValidAccessToken(userId);

    const updatedEvent = await updateGoogleCalendarEvent(
      accessToken,
      calendarId,
      googleEventId,
      patch
    );

    return res.json({
      success: true,
      googleEventId: updatedEvent.id,
      htmlLink: updatedEvent.htmlLink,
    });
  } catch (error) {
    console.error("❌ Error actualizando evento en Google Calendar:", error);

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
      message: "Failed to update Google Calendar event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
