const https = require("https");

// Script simple para probar el endpoint de exportación
// Nota: Este script solo verifica que el endpoint responda sin errores de módulos

const postData = JSON.stringify({
  searchQuery: "",
  roleFilter: "",
  subscriptionStatusFilter: "",
  agenciaBrokerFilter: "",
  priceIdFilter: "",
  currencyFilter: "",
  hasSubscriptionIdFilter: "",
  hasCustomerIdFilter: "",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/backoffice/export-crm-users",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("🧪 Probando el endpoint de exportación...");

const req = https.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  if (res.statusCode === 401) {
    console.log(
      "✅ Endpoint responde correctamente (401 = no autenticado, como es esperado)"
    );
  } else if (res.statusCode === 500) {
    console.log("❌ Error 500 - puede ser el problema del módulo XLSX");
  } else {
    console.log(`📝 Respuesta inesperada: ${res.statusCode}`);
  }

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const jsonData = JSON.parse(data);
      console.log("📄 Respuesta:", jsonData);
    } catch (e) {
      console.log("📄 Respuesta (raw):", data.substring(0, 200) + "...");
    }
  });
});

req.on("error", (e) => {
  console.error("❌ Error:", e.message);
});

req.write(postData);
req.end();
