const { db } = require("../lib/firebaseAdmin");
const fs = require("fs");
const path = require("path");

/**
 * Script para exportar todas las operaciones de Firestore a un archivo JSON
 * Este JSON será usado por un bot para responder preguntas sobre operaciones
 *
 * IMPORTANTE: El bot debe filtrar las operaciones por user_uid antes de responder
 * para que cada usuario solo vea sus propias operaciones.
 */

interface Operation {
  id: string;
  teamId: string; // UID del usuario que creó la operación
  user_uid: string; // UID del asesor principal asignado
  user_uid_adicional?: string | null; // UID del asesor adicional
  fecha_operacion: string;
  fecha_captacion: string;
  fecha_reserva?: string;
  direccion_reserva: string;
  localidad_reserva: string;
  provincia_reserva: string;
  pais: string;
  numero_casa: string;
  tipo_operacion: string;
  tipo_inmueble?: string | null;
  valor_reserva: number;
  numero_sobre_reserva?: string | null;
  numero_sobre_refuerzo?: string | null;
  monto_sobre_reserva?: number | null;
  monto_sobre_refuerzo?: number | null;
  porcentaje_honorarios_asesor: number;
  porcentaje_honorarios_broker: number;
  porcentaje_punta_compradora: number;
  porcentaje_punta_vendedora: number;
  porcentaje_compartido?: number | null;
  porcentaje_referido?: number | null;
  honorarios_broker: number;
  honorarios_asesor: number;
  referido?: string | null;
  compartido?: string | null;
  realizador_venta: string;
  realizador_venta_adicional?: string | null;
  porcentaje_honorarios_asesor_adicional?: number | null;
  estado: string;
  observaciones?: string | null;
  exclusiva?: boolean | string;
  no_exclusiva?: boolean | string;
  gastos_operacion?: number | null;
  beneficio_despues_gastos?: number | null;
  rentabilidad?: number | null;
  punta_compradora: boolean;
  punta_vendedora: boolean;
  reparticion_honorarios_asesor: number;
  isFranchiseOrBroker?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ExportData {
  exportDate: string;
  totalOperations: number;
  operations: Operation[];
  metadata: {
    version: string;
    description: string;
    filterInstructions: string;
  };
}

async function exportOperations() {
  try {
    console.log("🔄 Iniciando exportación de operaciones...");

    // Obtener todas las operaciones de Firestore
    const snapshot = await db.collection("operations").get();

    if (snapshot.empty) {
      console.log("⚠️ No se encontraron operaciones en la base de datos");
      return;
    }

    // Mapear los documentos a objetos Operation
    const operations: Operation[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Operation[];

    console.log(`✅ Se encontraron ${operations.length} operaciones`);

    // Crear objeto con metadata
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      totalOperations: operations.length,
      operations: operations,
      metadata: {
        version: "1.0",
        description: "Exportación completa de operaciones inmobiliarias",
        filterInstructions:
          "IMPORTANTE: Cuando un usuario haga una pregunta, DEBES filtrar las operaciones comparando el uid del usuario con el campo 'teamId' de cada operación. El 'teamId' contiene el uid del usuario que creó/posee la operación. Solo mostrar las operaciones donde operation.teamId === userUid.",
      },
    };

    // Crear directorio de exportación si no existe
    const exportDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `operations-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    // También crear una versión "latest" para fácil acceso
    const latestFilepath = path.join(exportDir, "operations-latest.json");

    // Guardar archivo con formato legible
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf-8");
    fs.writeFileSync(
      latestFilepath,
      JSON.stringify(exportData, null, 2),
      "utf-8"
    );

    console.log(`✅ Operaciones exportadas exitosamente:`);
    console.log(`   📄 Archivo con timestamp: ${filepath}`);
    console.log(`   📄 Archivo latest: ${latestFilepath}`);
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total de operaciones: ${operations.length}`);

    // Estadísticas adicionales
    const operationsByType = operations.reduce(
      (acc, op) => {
        acc[op.tipo_operacion] = (acc[op.tipo_operacion] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`   Por tipo de operación:`);
    Object.entries(operationsByType).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });

    const operationsByStatus = operations.reduce(
      (acc, op) => {
        acc[op.estado] = (acc[op.estado] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`   Por estado:`);
    Object.entries(operationsByStatus).forEach(([status, count]) => {
      console.log(`     - ${status}: ${count}`);
    });

    // Contar usuarios únicos (creadores de operaciones)
    const uniqueUsers = new Set<string>();
    operations.forEach((op) => {
      uniqueUsers.add(op.teamId);
    });

    console.log(`   Usuarios únicos (creadores): ${uniqueUsers.size}`);

    console.log(
      `\n💡 Para usar con tu bot, sube el archivo a Google Drive y configura el bot para:`
    );
    console.log(
      `   1. Leer el JSON desde Google Drive (usa el archivo "operations-latest.json")`
    );
    console.log(`   2. Cuando un usuario haga una pregunta, obtener su uid`);
    console.log(
      `   3. Filtrar las operaciones: operations.filter(op => op.teamId === userUid)`
    );
    console.log(
      `   4. Responder solo con información de las operaciones filtradas`
    );
    console.log(`\n   Nota: teamId = uid del usuario creador de la operación`);
  } catch (error) {
    console.error("❌ Error exportando operaciones:", error);
    throw error;
  }
}

// Ejecutar el script
exportOperations()
  .then(() => {
    console.log("\n✅ Script finalizado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error en el script:", error);
    process.exit(1);
  });
