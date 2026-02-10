import type { NextApiRequest, NextApiResponse } from "next";
import { db, adminAuth } from "@/lib/firebaseAdmin";
import * as XLSX from "xlsx";
import {
  validateSchema,
  exportCrmUsersSchema,
  ApiResponder,
} from "@/lib/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const respond = new ApiResponder(res);

  if (req.method !== "POST") {
    return respond.methodNotAllowed();
  }

  try {
    // 🔹 Verificar autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return respond.unauthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userUID = decodedToken.uid;

    // 🔹 Verificar que el usuario tiene acceso al backoffice
    const userDoc = await db.collection("usuarios").doc(userUID).get();
    if (!userDoc.exists) {
      return respond.notFound("Usuario no encontrado");
    }

    const userData = userDoc.data();

    const allowedEmails = [
      "gustavo@gustavodesimone.com",
      "mariano@bigbangla.biz",
      "msmanavella.profesional@gmail.com",
    ];

    const hasBackofficeAccess = allowedEmails.includes(userData?.email);

    if (!hasBackofficeAccess) {
      return respond.forbidden(
        "Acceso denegado: Se requiere acceso a backoffice"
      );
    }

    // 🔹 Validar y obtener filtros del body de la request
    const validation = validateSchema(exportCrmUsersSchema, req.body);
    if (!validation.success) {
      return respond.validationError(validation.errors);
    }

    const {
      searchQuery,
      roleFilter,
      subscriptionStatusFilter,
      agenciaBrokerFilter,
      priceIdFilter,
      currencyFilter,
      hasSubscriptionIdFilter,
      hasCustomerIdFilter,
    } = validation.data;

    // 🔹 Obtener todos los usuarios desde Firestore
    const querySnapshot = await db.collection("usuarios").get();

    if (querySnapshot.empty) {
      return respond.notFound("No se encontraron usuarios");
    }

    // 🔹 Convertir documentos a formato de datos del CRM
    let users = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid || "",
        nombre: data.nombre || "",
        firstName: data.firstName || "",
        displayName: data.displayName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        telefono: data.telefono || data.phone || data.numeroTelefono || "",
        fechaCreacion: data.fechaCreacion || data.createdAt || "",
        lastLoginDate: data.lastLoginDate || "",
        stripeCustomerId: data.stripeCustomerId || data.stripeCustomerID || "",
        stripeSubscriptionId:
          data.stripeSubscriptionId || data.stripeSubscriptionID || "",
        subscriptionStatus: data.subscriptionStatus || "",
        trialStartDate: data.trialStartDate || "",
        trialEndDate: data.trialEndDate || "",
        agenciaBroker: data.agenciaBroker || "",
        priceId: data.priceId || "",
        role: data.role || "",
        currency: data.currency || "",
        currencySymbol: data.currencySymbol || "",
        noUpdates: data.noUpdates || false,
        welcomeModalShown: data.welcomeModalShown || false,
        subscriptionCanceledAt: data.subscriptionCanceledAt || "",
        lastSyncAt: data.lastSyncAt || "",
      };
    });

    // 🔹 Aplicar filtros como en el CRM
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          (user.nombre && user.nombre.toLowerCase().includes(query)) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.displayName &&
            user.displayName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)) ||
          (user.telefono && user.telefono.includes(query)) ||
          (user.agenciaBroker &&
            user.agenciaBroker.toLowerCase().includes(query))
      );
    }

    if (roleFilter) {
      users = users.filter((user) => user.role === roleFilter);
    }

    if (subscriptionStatusFilter) {
      users = users.filter(
        (user) => user.subscriptionStatus === subscriptionStatusFilter
      );
    }

    if (agenciaBrokerFilter) {
      users = users.filter(
        (user) => user.agenciaBroker === agenciaBrokerFilter
      );
    }

    if (priceIdFilter) {
      users = users.filter((user) => user.priceId === priceIdFilter);
    }

    if (currencyFilter) {
      users = users.filter((user) => user.currency === currencyFilter);
    }

    if (hasSubscriptionIdFilter) {
      const hasSubscription = hasSubscriptionIdFilter === "yes";
      users = users.filter((user) => {
        const hasId = !!(
          user.stripeSubscriptionId &&
          user.stripeSubscriptionId !== "" &&
          user.stripeSubscriptionId !== "N/A"
        );
        return hasSubscription ? hasId : !hasId;
      });
    }

    if (hasCustomerIdFilter) {
      const hasCustomer = hasCustomerIdFilter === "yes";
      users = users.filter((user) => {
        const hasId = !!(
          user.stripeCustomerId &&
          user.stripeCustomerId !== "" &&
          user.stripeCustomerId !== "N/A"
        );
        return hasCustomer ? hasId : !hasId;
      });
    }

    // 🔹 Preparar datos para Excel con columnas específicas
    const excelData = users.map((user) => ({
      ID: user.id,
      UID: user.uid,
      Nombre: user.nombre || user.firstName || user.displayName || "",
      Apellido: user.lastName || "",
      Email: user.email,
      Teléfono: user.telefono,
      "Fecha Creación": user.fechaCreacion,
      "Último Login": user.lastLoginDate,
      Rol: user.role,
      "Agencia/Broker": user.agenciaBroker,
      "Estado Suscripción": user.subscriptionStatus,
      "Customer ID": user.stripeCustomerId,
      "Subscription ID": user.stripeSubscriptionId,
      "Price ID": user.priceId,
      Moneda: user.currency,
      "Símbolo Moneda": user.currencySymbol,
      "Inicio Trial": user.trialStartDate,
      "Fin Trial": user.trialEndDate,
      "Suscripción Cancelada": user.subscriptionCanceledAt,
      "Última Sincronización": user.lastSyncAt,
      "Sin Actualizaciones": user.noUpdates ? "Sí" : "No",
      "Modal Bienvenida Mostrado": user.welcomeModalShown ? "Sí" : "No",
    }));

    // 🔹 Crear hoja de Excel con los datos
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 🔹 Configurar ancho de columnas
    const columnWidths = [
      { wch: 25 }, // ID
      { wch: 25 }, // UID
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 30 }, // Email
      { wch: 15 }, // Teléfono
      { wch: 20 }, // Fecha Creación
      { wch: 20 }, // Último Login
      { wch: 15 }, // Rol
      { wch: 25 }, // Agencia/Broker
      { wch: 20 }, // Estado Suscripción
      { wch: 25 }, // Customer ID
      { wch: 25 }, // Subscription ID
      { wch: 20 }, // Price ID
      { wch: 10 }, // Moneda
      { wch: 10 }, // Símbolo Moneda
      { wch: 20 }, // Inicio Trial
      { wch: 20 }, // Fin Trial
      { wch: 20 }, // Suscripción Cancelada
      { wch: 20 }, // Última Sincronización
      { wch: 15 }, // Sin Actualizaciones
      { wch: 20 }, // Modal Bienvenida Mostrado
    ];
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios CRM");

    // 🔹 Convertir a buffer y enviar como respuesta
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    // 🔹 Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `crm-usuarios-${timestamp}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error("Error al exportar usuarios del CRM:", error);
    return respond.internalError("Error al exportar usuarios del CRM");
  }
}
