import { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/authMiddleware";
import { db } from "@/lib/firebaseAdmin";
import {
  validateSchema,
  cleanUsersWithoutStripeSchema,
  ApiResponder,
} from "@/lib/schemas";

interface UserData {
  id: string;
  email?: string;
  nombre?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  stripeCustomerID?: string;
  stripeSubscriptionId?: string;
  stripeSubscriptionID?: string;
  subscriptionStatus?: string;
  role?: string;
  fechaCreacion?: any;
  createdAt?: any;
}

/**
 * API endpoint para limpiar usuarios sin datos de Stripe
 * Solo accesible para administradores del backoffice
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  try {
    // Verificar autenticación y autorización
    const decodedToken = await verifyToken(req, res);
    if (!decodedToken) return;

    // Verificar que sea el usuario autorizado para backoffice
    const isAuthorized =
      decodedToken.email === "mariano@bigbangla.biz" ||
      decodedToken.uid === "qaab6bRZHpZiRuq6981thD3mYm03";

    if (!isAuthorized) {
      return respond.forbidden("No tienes permisos para realizar esta acción");
    }

    // Validar body
    const validation = validateSchema(cleanUsersWithoutStripeSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const { mode } = validation.data;

    const usersSnapshot = await db.collection("usuarios").get();

    if (usersSnapshot.empty) {
      return respond.success(
        {
          stats: {
            total: 0,
            withBothIds: 0,
            withOnlyCustomerId: 0,
            withOnlySubscriptionId: 0,
            withoutBothIds: 0,
            trialUsers: 0,
            deleted: 0,
          },
        },
        "No se encontraron usuarios en la base de datos"
      );
    }

    // Analizar usuarios y clasificarlos
    const usersToDelete: UserData[] = [];
    const usersToKeep: UserData[] = [];
    const stats = {
      total: 0,
      withBothIds: 0,
      withOnlyCustomerId: 0,
      withOnlySubscriptionId: 0,
      withoutBothIds: 0,
      trialUsers: 0,
      deleted: 0,
    };

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const user: UserData = {
        id: doc.id,
        email: userData.email,
        nombre: userData.nombre || userData.firstName,
        lastName: userData.lastName,
        stripeCustomerId:
          userData.stripeCustomerId || userData.stripeCustomerID,
        stripeSubscriptionId:
          userData.stripeSubscriptionId || userData.stripeSubscriptionID,
        subscriptionStatus: userData.subscriptionStatus,
        role: userData.role,
        fechaCreacion: userData.fechaCreacion || userData.createdAt,
      };

      stats.total++;

      // Verificar si tiene subscription ID (considerando "trial" como válido)
      const hasSubscriptionId = !!(
        user.stripeSubscriptionId && user.stripeSubscriptionId !== ""
      );
      const hasCustomerId = !!(
        user.stripeCustomerId && user.stripeCustomerId !== ""
      );
      const isTrialUser = user.stripeSubscriptionId === "trial";

      if (isTrialUser) {
        stats.trialUsers++;
        usersToKeep.push(user);
      } else if (hasSubscriptionId && hasCustomerId) {
        stats.withBothIds++;
        usersToKeep.push(user);
      } else if (hasCustomerId && !hasSubscriptionId) {
        stats.withOnlyCustomerId++;
        usersToKeep.push(user);
      } else if (hasSubscriptionId && !hasCustomerId) {
        stats.withOnlySubscriptionId++;
        usersToKeep.push(user);
      } else {
        // NO tiene subscriptionId Y NO tiene customerId
        stats.withoutBothIds++;
        usersToDelete.push(user);
      }
    });

    // Si es modo análisis, solo devolver estadísticas
    if (mode === "analyze") {
      return respond.success(
        {
          stats,
          usersToDelete: usersToDelete.slice(0, 10).map((user) => ({
            id: user.id,
            email: user.email || "Sin email",
            nombre: user.nombre || "Sin nombre",
            subscriptionStatus: user.subscriptionStatus || "Sin status",
          })),
        },
        "Análisis completado"
      );
    }

    // Modo ejecución - eliminar usuarios
    if (mode === "execute") {
      if (usersToDelete.length === 0) {
        return respond.success({ stats }, "No hay usuarios para eliminar");
      }

      const batchSize = 10;
      let deletedCount = 0;

      for (let i = 0; i < usersToDelete.length; i += batchSize) {
        const batch = usersToDelete.slice(i, i + batchSize);

        const deletePromises = batch.map(async (user) => {
          try {
            await db.collection("usuarios").doc(user.id).delete();
            deletedCount++;
            return { success: true, user };
          } catch (error) {
            console.error(`Error eliminando ${user.email || user.id}:`, error);
            return { success: false, user, error };
          }
        });

        await Promise.all(deletePromises);

        if (i + batchSize < usersToDelete.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      stats.deleted = deletedCount;

      return respond.success(
        { stats },
        `Limpieza completada. ${deletedCount} usuarios eliminados`
      );
    }

    return respond.badRequest("Modo no válido. Use 'analyze' o 'execute'");
  } catch (error) {
    console.error("Error durante la limpieza:", error);
    return respond.internalError("Error durante la limpieza");
  }
}
