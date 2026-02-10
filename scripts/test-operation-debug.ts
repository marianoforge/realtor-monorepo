/**
 * Script de prueba para testear la funcionalidad de debug de operaciones
 * Ejecutar con: npx ts-node scripts/test-operation-debug.ts
 */

const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp, getApps } = require("firebase-admin/app");

// Inicializar Firebase Admin si no está ya inicializado
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

async function testOperationDebug() {
  console.log("🔍 Iniciando test de debug de operaciones...\n");

  try {
    // 1. Buscar la operación específica mencionada
    console.log("1. Buscando operación r1uKlIKpRT0iJZGK9SlN...");
    const operationRef = db
      .collection("operations")
      .doc("r1uKlIKpRT0iJZGK9SlN");
    const operationSnap = await operationRef.get();

    if (operationSnap.exists) {
      console.log("✅ Operación encontrada!");
      const data = operationSnap.data();
      console.log("Detalles básicos:");
      console.log(`  - ID: ${operationSnap.id}`);
      console.log(`  - Dirección: ${data?.direccion_reserva || "N/A"}`);
      console.log(`  - Valor Reserva: $${data?.valor_reserva || 0}`);
      console.log(`  - Team ID: ${data?.teamId || "N/A"}`);
      console.log(`  - Asesor Principal: ${data?.user_uid || "N/A"}`);
      console.log(`  - Asesor Adicional: ${data?.user_uid_adicional || "N/A"}`);
      console.log(
        `  - % Asesor Principal: ${data?.porcentaje_honorarios_asesor || 0}%`
      );
      console.log(
        `  - % Asesor Adicional: ${data?.porcentaje_honorarios_asesor_adicional || 0}%`
      );
      console.log(`  - % Broker: ${data?.porcentaje_honorarios_broker || 0}%`);
    } else {
      console.log("❌ Operación NO encontrada en la base de datos");
    }

    console.log(
      "\n2. Buscando operaciones similares (con problemas de porcentajes)..."
    );

    // Buscar operaciones que tengan asesores con porcentajes altos
    const operationsSnap = await db
      .collection("operations")
      .where("porcentaje_honorarios_asesor", ">=", 40)
      .limit(5)
      .get();

    if (!operationsSnap.empty) {
      console.log(
        `✅ Encontradas ${operationsSnap.docs.length} operaciones con porcentajes altos:`
      );
      operationsSnap.docs.forEach((doc: any, index: number) => {
        const data = doc.data();
        console.log(`  ${index + 1}. ID: ${doc.id}`);
        console.log(`     - Dirección: ${data.direccion_reserva || "N/A"}`);
        console.log(
          `     - % Asesor: ${data.porcentaje_honorarios_asesor || 0}%`
        );
        console.log(
          `     - % Asesor Adicional: ${data.porcentaje_honorarios_asesor_adicional || 0}%`
        );
        console.log(`     - Valor: $${data.valor_reserva || 0}`);
      });
    } else {
      console.log("❌ No se encontraron operaciones con porcentajes altos");
    }

    console.log("\n3. Estadísticas generales de operaciones...");
    const allOperationsSnap = await db.collection("operations").get();
    const operations = allOperationsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const stats = {
      total: operations.length,
      withPrimaryAdvisor: operations.filter((op: any) => op.user_uid).length,
      withAdditionalAdvisor: operations.filter(
        (op: any) => op.user_uid_adicional
      ).length,
      withBothAdvisors: operations.filter(
        (op: any) => op.user_uid && op.user_uid_adicional
      ).length,
      withoutAdvisor: operations.filter((op: any) => !op.user_uid).length,
      highPercentagePrimary: operations.filter(
        (op: any) => (op.porcentaje_honorarios_asesor || 0) >= 50
      ).length,
      highPercentageAdditional: operations.filter(
        (op: any) => (op.porcentaje_honorarios_asesor_adicional || 0) >= 50
      ).length,
    };

    console.log("📊 Estadísticas:");
    console.log(`  - Total operaciones: ${stats.total}`);
    console.log(`  - Con asesor principal: ${stats.withPrimaryAdvisor}`);
    console.log(`  - Con asesor adicional: ${stats.withAdditionalAdvisor}`);
    console.log(`  - Con ambos asesores: ${stats.withBothAdvisors}`);
    console.log(`  - Sin asesor: ${stats.withoutAdvisor}`);
    console.log(
      `  - Con % asesor principal >= 50%: ${stats.highPercentagePrimary}`
    );
    console.log(
      `  - Con % asesor adicional >= 50%: ${stats.highPercentageAdditional}`
    );

    console.log("\n✅ Test completado exitosamente!");
    console.log("\n🎯 Próximos pasos:");
    console.log("1. Ve al backoffice: http://localhost:3000/backoffice");
    console.log('2. Usa la nueva sección "Debug de Operaciones y Agentes"');
    console.log("3. Prueba buscar la operación r1uKlIKpRT0iJZGK9SlN");
    console.log(
      "4. Si no existe, verifica con el usuario si el ID es correcto"
    );
  } catch (error) {
    console.error("❌ Error durante el test:", error);
  }
}

// Ejecutar el test
testOperationDebug()
  .then(() => {
    console.log("\n🏁 Script finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error fatal:", error);
    process.exit(1);
  });
