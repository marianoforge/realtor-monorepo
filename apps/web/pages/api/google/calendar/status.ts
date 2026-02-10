import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  isGoogleCalendarConnected,
  getValidAccessToken,
  disconnectGoogleCalendar,
} from "@/lib/googleTokens";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    if (req.method === "GET") {
      // Check connection status
      const isConnected = await isGoogleCalendarConnected(userId);

      let calendars = [];
      if (isConnected) {
        try {
          const accessToken = await getValidAccessToken(userId);

          // Fetch user's calendars
          const response = await fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            calendars =
              data.items?.map((cal: any) => ({
                id: cal.id,
                summary: cal.summary,
                primary: cal.primary || false,
                accessRole: cal.accessRole,
              })) || [];
          }
        } catch (error) {
          // Don't fail the whole request if calendar fetch fails
        }
      }

      return res.json({
        connected: isConnected,
        calendars,
      });
    } else if (req.method === "DELETE") {
      // Disconnect Google Calendar
      await disconnectGoogleCalendar(userId);

      return res.json({
        success: true,
        message: "Google Calendar disconnected successfully",
      });
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
