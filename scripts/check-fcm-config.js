#!/usr/bin/env node

/**
 * Script para verificar la configuración FCM
 */

const https = require("https");

const projectId = "gds-si";

console.log("🔍 Verificando configuración FCM para el proyecto:", projectId);
console.log("");

// Verificar que las variables de entorno estén configuradas
const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

console.log("📋 Variables de entorno:");
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  console.log(`   ${varName}: ${value ? "✅ Configurada" : "❌ Faltante"}`);
});

console.log("");
console.log("🔑 VAPID Key:");
const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
console.log(
  `   NEXT_PUBLIC_FIREBASE_VAPID_KEY: ${vapidKey ? "✅ Configurada" : "⚠️ No configurada"}`
);

if (vapidKey) {
  console.log(`   Valor: ${vapidKey.substring(0, 20)}...`);
  console.log(`   Longitud: ${vapidKey.length} caracteres`);

  // Las VAPID keys válidas suelen tener 88 caracteres y empezar con 'B'
  if (vapidKey.length === 88 && vapidKey.startsWith("B")) {
    console.log("   Formato: ✅ Parece válida");
  } else {
    console.log(
      "   Formato: ⚠️ Podría ser inválida (debería tener 88 chars y empezar con B)"
    );
  }
}

console.log("");
console.log("📝 Configuración del proyecto:");
console.log(
  `   Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "No configurado"}`
);
console.log(
  `   Messaging Sender ID: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "No configurado"}`
);

console.log("");
console.log("🔧 Para obtener/generar la VAPID key:");
console.log("   1. Ve a https://console.firebase.google.com");
console.log('   2. Selecciona el proyecto "gds-si"');
console.log("   3. Project Settings → Cloud Messaging");
console.log(
  '   4. En "Web Push certificates" → Generate Key Pair (si no existe)'
);
console.log("   5. Copia la clave pública y agrégala a tu .env.local como:");
console.log("      NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu_clave_aqui");
console.log("");
