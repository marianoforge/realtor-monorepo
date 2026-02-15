const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "../../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../../.env.local") });

const swPath = path.join(__dirname, "../public/firebase-messaging-sw.js");
let content = fs.readFileSync(swPath, "utf8");

const vars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

vars.forEach((name) => {
  const value = process.env[name] || "";
  content = content.replace(new RegExp(`__${name}__`, "g"), value);
});

fs.writeFileSync(swPath, content);
