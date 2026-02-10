import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    await adminAuth.verifyIdToken(token);

    const input = req.query.input as string;
    if (!input || input.trim() === "") {
      return res.status(400).json({ error: "Missing 'input' query parameter" });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("API key de Google Maps no configurada.");
      return res.status(500).json({ error: "API key is not configured" });
    }

    const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}`;

    const response = await fetch(googlePlacesUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(500).json({
        error: `Google Places API error: ${data.status}`,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error al obtener datos de Google Places API:", error);
    return res.status(500).json({
      error: "Failed to fetch data from Google Places API",
      message: error.message,
    });
  }
}
