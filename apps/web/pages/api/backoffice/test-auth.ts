import { NextApiRequest, NextApiResponse } from "next";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in test auth:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default withBackofficeAuth(handler);
