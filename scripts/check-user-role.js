const admin = require("firebase-admin");

// Verificar rol del usuario gustavo@gustavodesimone.com

// Inicializar Firebase Admin si no está inicializado
if (!admin.apps.length) {
  try {
    const serviceAccountPath =
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      "./service-account-key.json";
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.log("Usando credenciales por defecto...");
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function checkUserRole() {
  try {
    console.log("🔍 Verificando rol de gustavo@gustavodesimone.com...");

    // Buscar usuario por email
    const userQuery = await db
      .collection("usuarios")
      .where("email", "==", "gustavo@gustavodesimone.com")
      .get();

    if (userQuery.empty) {
      console.log('❌ Usuario no encontrado en la colección "usuarios"');
      return;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    console.log("✅ Usuario encontrado:");
    console.log(`📧 Email: ${userData.email}`);
    console.log(`👤 Nombre: ${userData.nombre || userData.firstName || "N/A"}`);
    console.log(`🎭 Rol actual: ${userData.role || "N/A"}`);
    console.log(`🆔 UID: ${userDoc.id}`);

    // Verificar si tiene acceso al backoffice
    const allowedRoles = ["superAdmin", "admin", "teamAdmin", "officeAdmin"];
    const hasBackofficeAccess = allowedRoles.includes(userData?.role);

    console.log(
      `🏢 Acceso al backoffice: ${hasBackofficeAccess ? "✅ SÍ" : "❌ NO"}`
    );

    if (!hasBackofficeAccess) {
      console.log(
        "📝 Roles permitidos para exportación:",
        allowedRoles.join(", ")
      );
      console.log(
        '💡 Sugerencia: Cambiar rol a "admin" o "superAdmin" para acceso completo'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error verificando usuario:", error);
    process.exit(1);
  }
}

checkUserRole();
