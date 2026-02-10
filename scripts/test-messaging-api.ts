#!/usr/bin/env npx ts-node

/**
 * Script para probar la API de messaging
 *
 * Uso: npx ts-node scripts/test-messaging-api.ts
 */

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import axios from "axios";

// Firebase configuration - usar las mismas variables que la app
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

interface TestConfig {
  senderEmail: string;
  senderPassword: string;
  receiverUserId: string;
  testMessage: string;
}

async function testMessagingAPI(config: TestConfig) {
  console.log("🧪 Iniciando pruebas de API de Messaging...\n");

  try {
    // 1. Autenticar usuario
    console.log("1️⃣ Autenticando usuario...");
    const userCredential = await signInWithEmailAndPassword(
      auth,
      config.senderEmail,
      config.senderPassword
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    console.log(`✅ Usuario autenticado: ${user.email}`);
    console.log(`📝 UID: ${user.uid}\n`);

    // 2. Obtener lista de usuarios
    console.log("2️⃣ Obteniendo lista de usuarios...");
    const usersResponse = await axios.get(`${BASE_URL}/api/messaging/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`✅ ${usersResponse.data.users.length} usuarios encontrados`);
    usersResponse.data.users.forEach((u: any) => {
      console.log(`   - ${u.name} (${u.email}) [${u.uid}]`);
    });
    console.log();

    // 3. Guardar FCM token (simulado)
    console.log("3️⃣ Guardando token FCM...");
    const fakeFcmToken = `fake_fcm_token_${Date.now()}`;

    await axios.post(
      `${BASE_URL}/api/messaging/save-fcm-token`,
      {
        token: fakeFcmToken,
        userID: user.uid,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`✅ Token FCM guardado: ${fakeFcmToken.substring(0, 30)}...\n`);

    // 4. Enviar mensaje
    console.log("4️⃣ Enviando mensaje de prueba...");
    const messageResponse = await axios.post(
      `${BASE_URL}/api/messaging/send-message`,
      {
        senderId: user.uid,
        senderName: user.displayName || "Test User",
        senderEmail: user.email,
        receiverId: config.receiverUserId,
        content: config.testMessage,
        type: "text",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`✅ Mensaje enviado con ID: ${messageResponse.data.messageId}`);
    console.log(`📄 Contenido: "${config.testMessage}"\n`);

    // 5. Obtener mensajes (si existe el endpoint)
    console.log("5️⃣ Obteniendo mensajes...");
    try {
      const messagesResponse = await axios.get(
        `${BASE_URL}/api/messaging/messages?otherUserId=${config.receiverUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        `✅ ${messagesResponse.data.messages.length} mensajes encontrados`
      );
      messagesResponse.data.messages.slice(0, 3).forEach((msg: any) => {
        console.log(
          `   - [${msg.timestamp}] ${msg.senderName}: ${msg.content}`
        );
      });
    } catch (error) {
      console.log(
        "⚠️ Error obteniendo mensajes (esto es normal si es la primera vez)"
      );
    }

    console.log("\n🎉 ¡Todas las pruebas completadas exitosamente!");
  } catch (error) {
    console.error("\n❌ Error durante las pruebas:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error("📄 Respuesta del servidor:", error.response.data);
      console.error("🔢 Código de estado:", error.response.status);
    }

    process.exit(1);
  }
}

// Configuración de prueba
const testConfig: TestConfig = {
  senderEmail: process.env.TEST_SENDER_EMAIL || "test@example.com",
  senderPassword: process.env.TEST_SENDER_PASSWORD || "testpassword",
  receiverUserId: process.env.TEST_RECEIVER_UID || "receiver_uid_here",
  testMessage:
    "🧪 Este es un mensaje de prueba del script automatizado de testing de la API de messaging.",
};

// Validar configuración
if (
  !testConfig.senderEmail ||
  !testConfig.senderPassword ||
  !testConfig.receiverUserId
) {
  console.error(
    "❌ Configuración incompleta. Por favor configura las variables de entorno:"
  );
  console.error("   - TEST_SENDER_EMAIL");
  console.error("   - TEST_SENDER_PASSWORD");
  console.error("   - TEST_RECEIVER_UID");
  console.error("\nO edita directamente el archivo script.");
  process.exit(1);
}

console.log("🔧 Configuración de prueba:");
console.log(`   Sender: ${testConfig.senderEmail}`);
console.log(`   Receiver UID: ${testConfig.receiverUserId}`);
console.log(`   Base URL: ${BASE_URL}\n`);

// Ejecutar pruebas
testMessagingAPI(testConfig);
