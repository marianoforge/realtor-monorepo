import admin from "firebase-admin";

// Verificar que las variables de entorno necesarias estén presentes
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Función de diagnóstico
const diagnoseFirebaseConfig = () => {
  const issues = [];

  if (!requiredEnvVars.projectId) issues.push("FIREBASE_PROJECT_ID missing");
  if (!requiredEnvVars.privateKey) issues.push("FIREBASE_PRIVATE_KEY missing");
  if (!requiredEnvVars.clientEmail)
    issues.push("FIREBASE_CLIENT_EMAIL missing");

  if (
    requiredEnvVars.privateKey &&
    !requiredEnvVars.privateKey.includes("BEGIN PRIVATE KEY")
  ) {
    issues.push("FIREBASE_PRIVATE_KEY format seems incorrect");
  }

  if (
    requiredEnvVars.clientEmail &&
    !requiredEnvVars.clientEmail.includes("@")
  ) {
    issues.push("FIREBASE_CLIENT_EMAIL format seems incorrect");
  }

  return issues;
};

// Validar variables de entorno
const configIssues = diagnoseFirebaseConfig();

if (configIssues.length > 0) {
  console.error("❌ Firebase Admin configuration issues:", configIssues);
  console.error("Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    projectId: requiredEnvVars.projectId ? "SET" : "MISSING",
    privateKey: requiredEnvVars.privateKey ? "SET" : "MISSING",
    clientEmail: requiredEnvVars.clientEmail ? "SET" : "MISSING",
  });
  throw new Error(
    `Firebase Admin configuration issues: ${configIssues.join(", ")}`
  );
}

if (!admin.apps.length) {
  try {
    // Crear credenciales de forma más robusta
    const serviceAccount = {
      projectId: requiredEnvVars.projectId!,
      privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, "\n"),
      clientEmail: requiredEnvVars.clientEmail!,
    };

    // Verificar que los datos sean válidos antes de inicializar
    if (
      !serviceAccount.projectId ||
      !serviceAccount.privateKey ||
      !serviceAccount.clientEmail
    ) {
      throw new Error("Invalid service account data after processing");
    }

    const credential = admin.credential.cert(serviceAccount);

    admin.initializeApp({
      credential,
      projectId: serviceAccount.projectId,
      // Agregar configuración específica para Vercel
      ...(process.env.VERCEL && {
        databaseURL: `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com/`,
      }),
    });
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      projectId: requiredEnvVars.projectId,
      hasPrivateKey: !!requiredEnvVars.privateKey,
      hasClientEmail: !!requiredEnvVars.clientEmail,
    });
    throw error;
  }
}

export const db = admin.firestore();
export const adminAuth = admin.auth();

// Función de diagnóstico exportada
export const diagnosisFirebaseAdmin = () => {
  return {
    isInitialized: admin.apps.length > 0,
    projectId: requiredEnvVars.projectId,
    hasPrivateKey: !!requiredEnvVars.privateKey,
    hasClientEmail: !!requiredEnvVars.clientEmail,
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    issues: diagnoseFirebaseConfig(),
  };
};
