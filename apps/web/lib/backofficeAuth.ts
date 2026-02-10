import { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";
import {
  AUTHORIZED_BACKOFFICE_EMAILS,
  AUTHORIZED_BACKOFFICE_UIDS,
} from "@/lib/authorizedUsers";

// Re-export para mantener compatibilidad con imports existentes en API routes
export { AUTHORIZED_BACKOFFICE_EMAILS, AUTHORIZED_BACKOFFICE_UIDS };

export const verifyBackofficeAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> => {
  try {
    // Verificar que haya header de autorización
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "No authorization header provided",
      });
      return false;
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
      return false;
    }

    // Verificar el token con Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Verificar que el email o UID esté en la lista de autorizados
    const isEmailAuthorized = AUTHORIZED_BACKOFFICE_EMAILS.includes(
      decodedToken.email || ""
    );
    const isUidAuthorized = AUTHORIZED_BACKOFFICE_UIDS.includes(
      decodedToken.uid
    );

    if (!isEmailAuthorized && !isUidAuthorized) {
      res.status(403).json({
        success: false,
        message: "Access denied: Insufficient permissions",
        debug: {
          email: decodedToken.email,
          uid: decodedToken.uid,
        },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Backoffice auth error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return false;
  }
};

export const withBackofficeAuth = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isAuthorized = await verifyBackofficeAuth(req, res);
    if (!isAuthorized) {
      return; // Response already sent by verifyBackofficeAuth
    }

    return handler(req, res);
  };
};
