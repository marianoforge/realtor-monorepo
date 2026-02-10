import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getValidAccessToken } from "@/lib/googleTokens";

interface CreateEventRequest {
  title: string;
  description?: string;
  startISO: string; // ISO 8601 format with timezone
  endISO: string; // ISO 8601 format with timezone
  attendees?: string[];
  calendarId?: string;
  location?: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{ email: string; responseStatus?: string }>;
  location?: string;
  htmlLink: string;
}

async function createGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventData: CreateEventRequest
): Promise<GoogleCalendarEvent> {
  const body = {
    summary: eventData.title,
    description: eventData.description || "",
    start: {
      dateTime: eventData.startISO,
      timeZone: "America/Argentina/Buenos_Aires", // Adjust to your timezone
    },
    end: {
      dateTime: eventData.endISO,
      timeZone: "America/Argentina/Buenos_Aires",
    },
    attendees: (eventData.attendees || []).map((email: string) => ({ email })),
    location: eventData.location || "",
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

    const {
      title,
      description,
      startISO,
      endISO,
      attendees,
      calendarId = "primary",
      location,
    } = req.body as CreateEventRequest;

    if (!title || !startISO || !endISO) {
      return res.status(400).json({
        message: "Missing required fields: title, startISO, endISO",
      });
    }

    const accessToken = await getValidAccessToken(userId);

    const googleEvent = await createGoogleCalendarEvent(
      accessToken,
      calendarId,
      {
        title,
        description,
        startISO,
        endISO,
        attendees,
        location,
      }
    );

    return res.json({
      googleEventId: googleEvent.id,
      htmlLink: googleEvent.htmlLink,
      success: true,
    });
  } catch (error) {
    console.error("Error creando evento en Google Calendar:", error);

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
      message: "Failed to create Google Calendar event",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
