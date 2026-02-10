const admin = require("firebase-admin");

// Configurar Firebase Admin
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    console.error(
      "❌ Error: GOOGLE_APPLICATION_CREDENTIALS no está configurado."
    );
    console.log(
      "Para usar este script, configura las credenciales de Firebase:"
    );
    console.log(
      "export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json"
    );
    process.exit(1);
  }
}

const firestore = admin.firestore();

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
 * Script para eliminar usuarios que NO tienen tanto subscriptionId como customerId
 * Criterio: (!subscriptionId) && (!customerId) - ambos deben estar ausentes
 */
async function cleanUsersWithoutStripeData() {
  console.log("🚀 Iniciando limpieza de usuarios sin datos de Stripe...");
  console.log(
    "📋 Criterio: Eliminar usuarios que NO tienen subscriptionId Y NO tienen customerId"
  );
  console.log("");

  try {
    // Obtener todos los usuarios
    console.log(
      "📥 Obteniendo todos los usuarios de la colección 'usuarios'..."
    );
    const usersSnapshot = await firestore.collection("usuarios").get();

    if (usersSnapshot.empty) {
      console.log("⚠️ No se encontraron usuarios en la base de datos.");
      return;
    }

    console.log(`📊 Total de usuarios encontrados: ${usersSnapshot.size}`);
    console.log("");

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
    };

    usersSnapshot.forEach((doc: any) => {
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

    // Mostrar estadísticas
    console.log("📊 ANÁLISIS DE USUARIOS:");
    console.log(`📈 Total de usuarios: ${stats.total}`);
    console.log(
      `✅ Con ambos IDs (customer + subscription): ${stats.withBothIds}`
    );
    console.log(`🟡 Solo con Customer ID: ${stats.withOnlyCustomerId}`);
    console.log(`🟠 Solo con Subscription ID: ${stats.withOnlySubscriptionId}`);
    console.log(`👤 Usuarios trial: ${stats.trialUsers}`);
    console.log(`❌ Sin ningún ID (SERÁN ELIMINADOS): ${stats.withoutBothIds}`);
    console.log("");

    if (usersToDelete.length === 0) {
      console.log(
        "✅ No hay usuarios para eliminar. Todos tienen al menos un ID de Stripe."
      );
      return;
    }

    // Mostrar usuarios que serán eliminados
    console.log("🗑️ USUARIOS QUE SERÁN ELIMINADOS:");
    console.log("═".repeat(80));
    usersToDelete.forEach((user, index) => {
      const displayName = user.nombre || user.email || "Sin nombre";
      const email = user.email || "Sin email";
      const role = user.role || "Sin role";
      const status = user.subscriptionStatus || "Sin status";

      console.log(`${index + 1}. ${displayName} (${email})`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   👤 Role: ${role}`);
      console.log(`   📊 Status: ${status}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(
        `   📅 Creado: ${user.fechaCreacion ? new Date(user.fechaCreacion.toDate()).toLocaleDateString() : "N/A"}`
      );
      console.log("");
    });

    // Confirmación de seguridad
    console.log("⚠️ CONFIRMACIÓN REQUERIDA ⚠️");
    console.log(
      `Estás a punto de eliminar ${usersToDelete.length} usuarios de la base de datos.`
    );
    console.log("Esta acción NO se puede deshacer.");
    console.log("");
    console.log(
      "Para proceder, descomenta la línea que dice 'UNCOMMENT_TO_EXECUTE' en el código."
    );
    console.log("");

    // SAFETY CHECK - Descomenta la siguiente línea para ejecutar la eliminación
    // const UNCOMMENT_TO_EXECUTE = true;
    const UNCOMMENT_TO_EXECUTE: boolean | undefined = undefined;

    if (typeof UNCOMMENT_TO_EXECUTE === "undefined") {
      console.log(
        "🛡️ Script ejecutado en modo SIMULACIÓN. No se eliminaron usuarios."
      );
      console.log(
        "Para ejecutar realmente, descomenta la variable UNCOMMENT_TO_EXECUTE."
      );
      return;
    }

    // Proceder con la eliminación
    console.log("🔥 INICIANDO ELIMINACIÓN DE USUARIOS...");

    const batchSize = 10; // Eliminar en lotes para evitar sobrecarga
    for (let i = 0; i < usersToDelete.length; i += batchSize) {
      const batch = usersToDelete.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(usersToDelete.length / batchSize);

      console.log(
        `📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} usuarios)...`
      );

      const deletePromises = batch.map(async (user) => {
        try {
          await firestore.collection("usuarios").doc(user.id).delete();
          console.log(`✅ Eliminado: ${user.email || user.id}`);
          return { success: true, user };
        } catch (error) {
          console.error(`❌ Error eliminando ${user.email || user.id}:`, error);
          return { success: false, user, error };
        }
      });

      await Promise.all(deletePromises);

      // Pausa entre lotes
      if (i + batchSize < usersToDelete.length) {
        console.log("⏳ Pausa de 1 segundo entre lotes...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log("");
    console.log("🎉 LIMPIEZA COMPLETADA");
    console.log(`✅ Usuarios eliminados: ${usersToDelete.length}`);
    console.log(`✅ Usuarios conservados: ${usersToKeep.length}`);
    console.log("📊 La base de datos ha sido limpiada exitosamente.");
  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    process.exit(1);
  }
}

// Función principal
async function main() {
  try {
    await cleanUsersWithoutStripeData();
    console.log("\n🏁 Script completado.");
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

module.exports = { cleanUsersWithoutStripeData };
