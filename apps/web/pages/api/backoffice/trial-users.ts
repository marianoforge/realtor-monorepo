import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin";
import { withBackofficeAuth } from "@/lib/backofficeAuth";

const convertFirestoreDate = (dateField: any) => {
  if (!dateField) {
    return null;
  }

  if (typeof dateField === "string") {
    return dateField;
  }

  if (dateField && dateField.seconds) {
    try {
      const date = new Date(dateField.seconds * 1000);
      return date.toISOString();
    } catch (error) {
      console.error("Error converting timestamp:", error);
      return null;
    }
  }

  if (dateField && typeof dateField.toDate === "function") {
    try {
      const date = dateField.toDate();
      return date.toISOString();
    } catch (error) {
      console.error("Error with toDate:", error);
      return null;
    }
  }

  try {
    const date = new Date(dateField);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.error("Direct Date conversion failed:", error);
  }

  return `RAW: ${JSON.stringify(dateField)}`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Solo permitir GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { listAll, listWithoutSubscription } = req.query;

    if (listAll === "true") {
      const usersSnapshot = await db.collection("usuarios").limit(50).get();

      const allUsers = usersSnapshot.docs.map((doc) => {
        const user = doc.data();

        return {
          id: doc.id,
          email: user.email,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: user.subscriptionStatus,
          nombre: user.nombre || user.firstName || user.displayName,
          fechaCreacion: convertFirestoreDate(
            user.fechaCreacion || user.createdAt
          ),
          lastLoginDate: convertFirestoreDate(user.lastLoginDate),
          // Mostrar todos los campos para debug
          allFields: Object.keys(user),
        };
      });

      return res.status(200).json({
        success: true,
        debug: true,
        users: allUsers,
        count: allUsers.length,
        message: "Listando todos los usuarios para debug",
      });
    }

    if (listWithoutSubscription === "true") {
      const usersSnapshot = await db.collection("usuarios").get();

      const usersWithoutSubscription = usersSnapshot.docs
        .filter((doc) => {
          const user = doc.data();
          return (
            !user.stripeSubscriptionId || user.stripeSubscriptionId === null
          );
        })
        .map((doc) => {
          const user = doc.data();
          return {
            id: doc.id,
            uid: user.uid,
            nombre:
              user.nombre ||
              user.firstName ||
              user.displayName ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email,
            telefono: user.telefono || user.phone || user.numeroTelefono,
            fechaCreacion: convertFirestoreDate(
              user.fechaCreacion || user.createdAt
            ),
            lastLoginDate: convertFirestoreDate(user.lastLoginDate),
            stripeSubscriptionId: user.stripeSubscriptionId,
            subscriptionStatus: user.subscriptionStatus,
            trialStartDate: convertFirestoreDate(user.trialStartDate),
            trialEndDate: convertFirestoreDate(user.trialEndDate),
            agenciaBroker: user.agenciaBroker,
            // Incluir todos los campos para el modal
            allFields: Object.keys(user),
          };
        });

      // Ordenar manualmente por fecha de creación (más recientes primero)
      usersWithoutSubscription.sort((a, b) => {
        const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
        const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
        return dateB - dateA;
      });

      return res.status(200).json({
        success: true,
        users: usersWithoutSubscription,
        count: usersWithoutSubscription.length,
        message: "Usuarios sin stripeSubscriptionId",
      });
    }

    const usersSnapshot = await db
      .collection("usuarios")
      .where("stripeSubscriptionId", "==", "trial")
      .get();

    const formattedUsers = usersSnapshot.docs.map((doc) => {
      const user = doc.data();
      return {
        id: doc.id,
        uid: user.uid,
        nombre:
          user.nombre ||
          user.firstName ||
          user.displayName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        telefono: user.telefono || user.phone || user.numeroTelefono,
        fechaCreacion: convertFirestoreDate(
          user.fechaCreacion || user.createdAt
        ),
        lastLoginDate: convertFirestoreDate(user.lastLoginDate),
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionStatus: user.subscriptionStatus,
        trialStartDate: convertFirestoreDate(user.trialStartDate),
        trialEndDate: convertFirestoreDate(user.trialEndDate),
        agenciaBroker: user.agenciaBroker,
      };
    });

    formattedUsers.sort((a, b) => {
      const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
      const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      users: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error) {
    console.error("Error al obtener usuarios con trial:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default withBackofficeAuth(handler);
