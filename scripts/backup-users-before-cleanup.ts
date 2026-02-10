import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Configurar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("../service-account-key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

/**
 * Script para crear un respaldo de todos los usuarios antes de la limpieza
 */
async function backupUsersBeforeCleanup() {
  console.log("💾 Iniciando respaldo de usuarios antes de la limpieza...");

  try {
    // Obtener todos los usuarios
    console.log("📥 Obteniendo todos los usuarios...");
    const usersSnapshot = await firestore.collection("usuarios").get();

    if (usersSnapshot.empty) {
      console.log("⚠️ No se encontraron usuarios para respaldar.");
      return;
    }

    console.log(`📊 Total de usuarios encontrados: ${usersSnapshot.size}`);

    // Convertir a formato JSON
    const usersData: any[] = [];
    const usersToDelete: any[] = [];
    const usersToKeep: any[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userWithId = {
        id: doc.id,
        ...userData,
        // Convertir timestamps a strings para JSON
        fechaCreacion: userData.fechaCreacion
          ? userData.fechaCreacion.toDate().toISOString()
          : null,
        createdAt: userData.createdAt
          ? userData.createdAt.toDate().toISOString()
          : null,
        trialStartDate: userData.trialStartDate
          ? userData.trialStartDate.toDate().toISOString()
          : null,
        trialEndDate: userData.trialEndDate
          ? userData.trialEndDate.toDate().toISOString()
          : null,
        lastLoginDate: userData.lastLoginDate
          ? userData.lastLoginDate.toDate().toISOString()
          : null,
      };

      usersData.push(userWithId);

      // Clasificar usuarios según el criterio de eliminación
      const hasSubscriptionId = !!(
        (userData.stripeSubscriptionId || userData.stripeSubscriptionID) &&
        userData.stripeSubscriptionId !== "" &&
        userData.stripeSubscriptionID !== ""
      );
      const hasCustomerId = !!(
        (userData.stripeCustomerId || userData.stripeCustomerID) &&
        userData.stripeCustomerId !== "" &&
        userData.stripeCustomerID !== ""
      );
      const isTrialUser = userData.stripeSubscriptionId === "trial";

      // Criterio: NO tiene subscriptionId Y NO tiene customerId (y no es trial)
      if (!hasSubscriptionId && !hasCustomerId && !isTrialUser) {
        usersToDelete.push(userWithId);
      } else {
        usersToKeep.push(userWithId);
      }
    });

    // Crear directorio de respaldos si no existe
    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generar timestamp para nombres de archivos
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Guardar respaldo completo
    const allUsersFile = path.join(
      backupDir,
      `all-users-backup-${timestamp}.json`
    );
    fs.writeFileSync(allUsersFile, JSON.stringify(usersData, null, 2));
    console.log(`✅ Respaldo completo guardado: ${allUsersFile}`);

    // Guardar usuarios que serán eliminados
    const usersToDeleteFile = path.join(
      backupDir,
      `users-to-delete-${timestamp}.json`
    );
    fs.writeFileSync(usersToDeleteFile, JSON.stringify(usersToDelete, null, 2));
    console.log(`🗑️ Usuarios a eliminar guardados: ${usersToDeleteFile}`);

    // Guardar usuarios que se conservarán
    const usersToKeepFile = path.join(
      backupDir,
      `users-to-keep-${timestamp}.json`
    );
    fs.writeFileSync(usersToKeepFile, JSON.stringify(usersToKeep, null, 2));
    console.log(`✅ Usuarios a conservar guardados: ${usersToKeepFile}`);

    // Crear resumen
    const summary = {
      backupDate: new Date().toISOString(),
      totalUsers: usersData.length,
      usersToDelete: usersToDelete.length,
      usersToKeep: usersToKeep.length,
      deletionCriteria:
        "NO tiene subscriptionId Y NO tiene customerId (excluyendo usuarios trial)",
      files: {
        allUsers: `all-users-backup-${timestamp}.json`,
        usersToDelete: `users-to-delete-${timestamp}.json`,
        usersToKeep: `users-to-keep-${timestamp}.json`,
      },
      sampleUsersToDelete: usersToDelete.slice(0, 5).map((user) => ({
        id: user.id,
        email: user.email,
        nombre: user.nombre || user.firstName,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId || user.stripeCustomerID,
        stripeSubscriptionId:
          user.stripeSubscriptionId || user.stripeSubscriptionID,
      })),
    };

    const summaryFile = path.join(
      backupDir,
      `backup-summary-${timestamp}.json`
    );
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Resumen guardado: ${summaryFile}`);

    console.log("");
    console.log("📊 RESUMEN DEL RESPALDO:");
    console.log(`📈 Total de usuarios: ${summary.totalUsers}`);
    console.log(`🗑️ Usuarios que serán eliminados: ${summary.usersToDelete}`);
    console.log(`✅ Usuarios que se conservarán: ${summary.usersToKeep}`);
    console.log("");
    console.log("💾 Respaldo completado exitosamente.");
    console.log(`📁 Archivos guardados en: ${backupDir}`);

    return {
      totalUsers: summary.totalUsers,
      usersToDelete: summary.usersToDelete,
      usersToKeep: summary.usersToKeep,
      backupFiles: summary.files,
    };
  } catch (error) {
    console.error("❌ Error durante el respaldo:", error);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    await backupUsersBeforeCleanup();
    console.log("\n🏁 Respaldo completado.");
    process.exit(0);
  } catch (error) {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

export { backupUsersBeforeCleanup };
