#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const appRoot = path.resolve(__dirname, "..");
const pkgPath = path.join(appRoot, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const deps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);

const requiredByConfig = [
  { file: "app.config.js", modules: ["path", "dotenv"] },
  { file: "metro.config.js", modules: ["path", "@expo/metro-config", "nativewind/metro", "react-native-svg-transformer"] },
  { file: ".babelrc.js", modules: ["babel-preset-expo", "nativewind/babel"] },
  { file: "app.json plugins", modules: ["expo-router", "expo-splash-screen", "expo-notifications", "expo-calendar"] },
];
const providedByExpo = new Set(["babel-preset-expo"]);

const toPackage = (name) => {
  if (name.startsWith("nativewind/")) return "nativewind";
  if (name.startsWith("expo-")) return name;
  return name;
};

const builtins = new Set(["path", "fs", "module", "require", "process"]);
const missing = [];

for (const { file, modules } of requiredByConfig) {
  for (const mod of modules) {
    if (builtins.has(mod)) continue;
    const pkgName = toPackage(mod);
    if (deps.has(pkgName) || providedByExpo.has(pkgName)) continue;
    missing.push({ file, module: mod, package: pkgName });
  }
}

if (missing.length) {
  console.log("Dependencias que podrían faltar en EAS (no están en apps/mobile/package.json):\n");
  missing.forEach(({ file, module, package: pkgName }) => console.log(`  ${file} → ${module} (paquete: ${pkgName})`));
  process.exit(1);
}

console.log("OK: Todas las dependencias usadas en config están declaradas en apps/mobile/package.json");
console.log("\nRecordatorio: en EAS el bundle usa solo lo instalado desde este package.json.");
console.log("Si el build sube solo apps/mobile, libs (@gds-si/shared-*) requieren que el monorepo esté en el build.");
