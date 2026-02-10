import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";
import {
  ApiResponder,
  validateSchema,
  updateCrmStatusSchema,
} from "@/lib/schemas";

// Tipo de las opciones del dropdown
export type CRMStatus =
  | "Bienvenida"
  | "Seguimiento"
  | "Aviso Fin de Trial"
  | "Ultimo Recordatorio";

interface TrialCRMUser {
  id: string;
  uid: string;
  nombre: string;
  lastName: string;
  email: string;
  telefono: string;
  fechaCreacion: string;
  subscriptionStatus: string;
  trialStartDate: string;
  trialEndDate: string;
  crmStatus?: CRMStatus;
  agenciaBroker?: string;
  role?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const convertFirestoreDate = (dateField: unknown): string | null => {
  if (!dateField) return null;

  // Si es un Timestamp de Firestore
  if (
    typeof dateField === "object" &&
    dateField !== null &&
    "toDate" in dateField &&
    typeof (dateField as { toDate: () => Date }).toDate === "function"
  ) {
    try {
      const date = (dateField as { toDate: () => Date }).toDate();
      return date.toISOString();
    } catch (error) {
      console.error("Error converting Firestore timestamp:", error);
      return null;
    }
  }

  // Si ya es una fecha válida
  if (dateField instanceof Date) {
    return dateField.toISOString();
  }

  // Si es un string, intentar parsearlo
  if (typeof dateField === "string") {
    const parsed = new Date(dateField);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return null;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const respond = new ApiResponder(res);

  if (req.method === "GET") {
    try {
      const crmSnapshot = await db.collection("realtor_crm").get();

      // Estados válidos para usuarios en trial
      const validTrialStatuses = ["trialing", "trial", "pending_payment"];

      const crmUsers: TrialCRMUser[] = crmSnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid || "",
            nombre: data.nombre || data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            telefono: data.telefono || data.phone || data.numeroTelefono || "",
            fechaCreacion:
              convertFirestoreDate(data.fechaCreacion || data.createdAt) || "",
            subscriptionStatus: data.subscriptionStatus || "",
            trialStartDate: convertFirestoreDate(data.trialStartDate) || "",
            trialEndDate: convertFirestoreDate(data.trialEndDate) || "",
            crmStatus: data.crmStatus,
            agenciaBroker: data.agenciaBroker,
            role: data.role,
            stripeCustomerId: data.stripeCustomerId || data.stripeCustomerID,
            stripeSubscriptionId:
              data.stripeSubscriptionId || data.stripeSubscriptionID,
          };
        })
        .filter((user) => {
          const status = user.subscriptionStatus?.toLowerCase() || "";
          const isValidTrialStatus = validTrialStatuses.includes(status);
          return isValidTrialStatus;
        });

      crmUsers.sort((a, b) => {
        const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        return dateB - dateA;
      });

      return respond.success({
        users: crmUsers,
        count: crmUsers.length,
      });
    } catch (error) {
      console.error("Error al obtener usuarios del Trial CRM:", error);
      return respond.internalError("Error al obtener usuarios del Trial CRM");
    }
  }

  // POST: Sincronizar usuarios en trial/trialing/pending_payment a realtor_crm
  if (req.method === "POST") {
    try {
      // Obtener todos los usuarios con status trialing, trial o pending_payment
      const usersSnapshot = await db
        .collection("usuarios")
        .where("subscriptionStatus", "in", [
          "trialing",
          "trial",
          "pending_payment",
        ])
        .get();

      if (usersSnapshot.docs.length === 0) {
        return respond.success(
          {
            syncedCount: 0,
            updatedCount: 0,
            totalProcessed: 0,
          },
          "No hay usuarios en trial/pending_payment para sincronizar"
        );
      }

      const crmSnapshot = await db.collection("realtor_crm").get();
      const existingCrmUsers = new Set(crmSnapshot.docs.map((doc) => doc.id));

      const usersInTrialIds = new Set(usersSnapshot.docs.map((doc) => doc.id));

      let syncedCount = 0;
      let updatedCount = 0;
      let removedCount = 0;

      const BATCH_SIZE = 500;
      const batches = [];
      let currentBatch = db.batch();
      let operationsInBatch = 0;

      for (const doc of usersSnapshot.docs) {
        const user = doc.data();
        const crmDocRef = db.collection("realtor_crm").doc(doc.id);

        const userData: Partial<TrialCRMUser> = {
          uid: user.uid,
          nombre: user.nombre || user.firstName || user.displayName || "",
          lastName: user.lastName || "",
          email: user.email,
          telefono: user.telefono || user.phone || user.numeroTelefono || "",
          fechaCreacion:
            convertFirestoreDate(user.fechaCreacion || user.createdAt) || "",
          subscriptionStatus: user.subscriptionStatus,
          trialStartDate: convertFirestoreDate(user.trialStartDate) || "",
          trialEndDate: convertFirestoreDate(user.trialEndDate) || "",
          agenciaBroker: user.agenciaBroker || "",
          role: user.role || "",
          stripeCustomerId:
            user.stripeCustomerId || user.stripeCustomerID || "",
          stripeSubscriptionId:
            user.stripeSubscriptionId || user.stripeSubscriptionID || "",
        };

        if (existingCrmUsers.has(doc.id)) {
          currentBatch.update(crmDocRef, {
            ...userData,
            updatedAt: new Date().toISOString(),
          });
          updatedCount++;
        } else {
          currentBatch.set(crmDocRef, {
            ...userData,
            crmStatus: "Bienvenida" as CRMStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          syncedCount++;
        }

        operationsInBatch++;

        if (operationsInBatch >= BATCH_SIZE) {
          batches.push(currentBatch.commit());
          currentBatch = db.batch();
          operationsInBatch = 0;
        }
      }

      if (operationsInBatch > 0) {
        batches.push(currentBatch.commit());
      }

      const usersToRemove = Array.from(existingCrmUsers).filter(
        (userId) => !usersInTrialIds.has(userId)
      );

      if (usersToRemove.length > 0) {
        const removeBatches = [];
        let currentRemoveBatch = db.batch();
        let removeOperationsInBatch = 0;

        for (const userId of usersToRemove) {
          const crmDocRef = db.collection("realtor_crm").doc(userId);
          currentRemoveBatch.delete(crmDocRef);
          removeOperationsInBatch++;
          removedCount++;

          if (removeOperationsInBatch >= BATCH_SIZE) {
            removeBatches.push(currentRemoveBatch.commit());
            currentRemoveBatch = db.batch();
            removeOperationsInBatch = 0;
          }
        }

        if (removeOperationsInBatch > 0) {
          removeBatches.push(currentRemoveBatch.commit());
        }

        await Promise.all(removeBatches);
      }

      await Promise.all(batches);

      return respond.success(
        {
          syncedCount,
          updatedCount,
          removedCount,
          totalProcessed: syncedCount + updatedCount + removedCount,
        },
        `Sincronización completada: ${syncedCount} nuevos, ${updatedCount} actualizados, ${removedCount} eliminados`
      );
    } catch (error) {
      console.error("Error al sincronizar usuarios:", error);
      return respond.internalError("Error al sincronizar usuarios");
    }
  }

  // PUT: Actualizar el crmStatus de un usuario
  if (req.method === "PUT") {
    try {
      // Validar body
      const validation = validateSchema(updateCrmStatusSchema, req.body);
      if (!validation.success) {
        return respond.validationError(validation.errors);
      }

      const { userId, crmStatus } = validation.data;

      await db.collection("realtor_crm").doc(userId).update({
        crmStatus,
        updatedAt: new Date().toISOString(),
      });

      return respond.success({}, "CRM Status actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar CRM Status:", error);
      return respond.internalError("Error al actualizar CRM Status");
    }
  }

  return respond.methodNotAllowed();
};

export default withBackofficeAuth(handler);
