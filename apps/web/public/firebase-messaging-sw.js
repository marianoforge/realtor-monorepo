// Firebase Cloud Messaging Service Worker
// This file is required by Firebase Messaging for background notifications

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Initialize Firebase with the project configuration
// Using the actual config from the environment
firebase.initializeApp({
  apiKey: "AIzaSyCTeeIYcE7YBLFzTnqtOd-78EZ6kic6RXY",
  authDomain: "gds-si.firebaseapp.com",
  projectId: "gds-si",
  storageBucket: "gds-si.appspot.com",
  messagingSenderId: "342233680729",
  appId: "1:342233680729:web:61230ada1e5b7737621a48",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "Nuevo mensaje";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes un nuevo mensaje",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data,
    actions: [
      {
        action: "open",
        title: "Abrir mensaje",
      },
      {
        action: "close",
        title: "Cerrar",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow("/dashboard?tab=messages"));
  }
});

console.log("✅ Firebase Messaging Service Worker loaded");
