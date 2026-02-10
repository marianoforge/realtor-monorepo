import { adminAuth } from "./firebaseAdmin";
import { validateUserSubscription } from "./subscriptionValidator";

export const verifyToken = async (req: any, res: any) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verificando token:", error);
    res.status(403).json({ error: "Token inválido o expirado" });
    return null;
  }
};

export const verifyTokenAndSubscription = async (req: any, res: any) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    res.status(401).json({ error: "Token no proporcionado" });
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    const subscriptionValidation = await validateUserSubscription(
      decodedToken.uid
    );

    if (!subscriptionValidation.isValid) {
      res.status(403).json({
        error: subscriptionValidation.errorMessage,
        errorCode: subscriptionValidation.errorCode,
      });
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error verificando token y suscripción:", error);
    res.status(403).json({ error: "Token inválido o expirado" });
    return null;
  }
};
