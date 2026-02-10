import ExcelJS from "exceljs";
import * as path from "path";
import * as fs from "fs";

// Definir las opciones para cada campo
const operationTypes = [
  "Venta",
  "Compra",
  "Alquiler Temporal",
  "Alquiler Tradicional",
  "Alquiler Comercial",
  "Fondo de Comercio",
  "Desarrollo Inmobiliario",
  "Cochera",
  "Loteamiento",
  "Lotes Para Desarrollos",
];

const estados = ["En Curso", "Cerrada", "Caída"];

const propertyTypes = [
  "Casa",
  "PH",
  "Departamentos",
  "Locales Comerciales",
  "Oficinas",
  "Naves Industriales",
  "Terrenos",
  "Chacras",
  "Otro",
];

const provincias = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const booleanOptions = ["TRUE", "FALSE"];

// Definir las columnas del formulario
const columns = [
  { header: "fecha_reserva*", key: "fecha_reserva", width: 15 },
  { header: "direccion_reserva*", key: "direccion_reserva", width: 30 },
  { header: "tipo_operacion*", key: "tipo_operacion", width: 20 },
  { header: "valor_reserva*", key: "valor_reserva", width: 15 },
  { header: "estado*", key: "estado", width: 15 },
  {
    header: "porcentaje_punta_compradora*",
    key: "porcentaje_punta_compradora",
    width: 25,
  },
  {
    header: "porcentaje_punta_vendedora",
    key: "porcentaje_punta_vendedora",
    width: 25,
  },
  { header: "punta_compradora*", key: "punta_compradora", width: 18 },
  { header: "punta_vendedora*", key: "punta_vendedora", width: 18 },
  { header: "tipo_inmueble", key: "tipo_inmueble", width: 18 },
  { header: "fecha_operacion", key: "fecha_operacion", width: 15 },
  { header: "fecha_captacion", key: "fecha_captacion", width: 15 },
  { header: "numero_casa", key: "numero_casa", width: 15 },
  { header: "localidad_reserva", key: "localidad_reserva", width: 20 },
  { header: "provincia_reserva", key: "provincia_reserva", width: 20 },
  {
    header: "porcentaje_honorarios_broker",
    key: "porcentaje_honorarios_broker",
    width: 25,
  },
  { header: "exclusiva", key: "exclusiva", width: 12 },
  { header: "no_exclusiva", key: "no_exclusiva", width: 15 },
  { header: "numero_sobre_reserva", key: "numero_sobre_reserva", width: 20 },
  { header: "numero_sobre_refuerzo", key: "numero_sobre_refuerzo", width: 20 },
  { header: "monto_sobre_reserva", key: "monto_sobre_reserva", width: 18 },
  { header: "monto_sobre_refuerzo", key: "monto_sobre_refuerzo", width: 18 },
  { header: "referido", key: "referido", width: 20 },
  { header: "compartido", key: "compartido", width: 20 },
  { header: "porcentaje_compartido", key: "porcentaje_compartido", width: 22 },
  { header: "porcentaje_referido", key: "porcentaje_referido", width: 20 },
  { header: "realizador_venta", key: "realizador_venta", width: 20 },
  {
    header: "porcentaje_honorarios_asesor",
    key: "porcentaje_honorarios_asesor",
    width: 28,
  },
  {
    header: "realizador_venta_adicional",
    key: "realizador_venta_adicional",
    width: 25,
  },
  {
    header: "porcentaje_honorarios_asesor_adicional",
    key: "porcentaje_honorarios_asesor_adicional",
    width: 35,
  },
  { header: "observaciones", key: "observaciones", width: 30 },
  { header: "pais", key: "pais", width: 15 },
  { header: "gastos_operacion", key: "gastos_operacion", width: 18 },
  { header: "captacion_no_es_mia", key: "captacion_no_es_mia", width: 20 },
];

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();

  // Crear hoja de datos
  const worksheet = workbook.addWorksheet("Operaciones");

  // Agregar columnas
  worksheet.columns = columns;

  // Estilo para el encabezado
  worksheet.getRow(1).font = { bold: true, size: 11 };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Aplicar colores diferentes a columnas obligatorias y opcionales
  columns.forEach((col, index) => {
    const cell = worksheet.getRow(1).getCell(index + 1);
    const isRequired = col.header.includes("*");

    if (isRequired) {
      // Color para columnas obligatorias (amarillo claro)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF99" }, // Amarillo claro
      };
    } else {
      // Color para columnas opcionales (gris claro)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }, // Gris claro
      };
    }
  });

  // Agregar validación de datos (dropdowns) para cada columna
  const totalRows = 1000; // Permitir hasta 1000 filas

  // Tipo de operación
  worksheet
    .getColumn("tipo_operacion")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${operationTypes.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Valor inválido",
          error:
            "Por favor selecciona un tipo de operación válido de la lista.",
        };
      }
    });

  // Estado
  worksheet
    .getColumn("estado")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: false,
          formulae: [`"${estados.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Valor inválido",
          error: "Por favor selecciona un estado válido de la lista.",
        };
      }
    });

  // Tipo de inmueble
  worksheet
    .getColumn("tipo_inmueble")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${propertyTypes.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Valor inválido",
          error: "Por favor selecciona un tipo de inmueble válido de la lista.",
        };
      }
    });

  // Provincia
  worksheet
    .getColumn("provincia_reserva")
    .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${provincias.join(",")}"`],
          showErrorMessage: true,
          errorTitle: "Valor inválido",
          error: "Por favor selecciona una provincia válida de la lista.",
        };
      }
    });

  // Booleanos
  [
    "punta_compradora",
    "punta_vendedora",
    "exclusiva",
    "no_exclusiva",
    "captacion_no_es_mia",
  ].forEach((colKey) => {
    worksheet
      .getColumn(colKey)
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.dataValidation = {
            type: "list",
            allowBlank:
              colKey !== "punta_compradora" && colKey !== "punta_vendedora",
            formulae: [`"${booleanOptions.join(",")}"`],
            showErrorMessage: true,
            errorTitle: "Valor inválido",
            error: "Por favor ingresa TRUE o FALSE.",
          };
        }
      });
  });

  // Validación de fechas (formato YYYY-MM-DD)
  ["fecha_reserva", "fecha_operacion", "fecha_captacion"].forEach((colKey) => {
    worksheet
      .getColumn(colKey)
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.dataValidation = {
            type: "custom",
            allowBlank: colKey !== "fecha_reserva",
            formulae: [
              'AND(LEN(TRIM(A1))=10, MID(TRIM(A1),5,1)="-", MID(TRIM(A1),8,1)="-")',
            ],
            showErrorMessage: true,
            errorTitle: "Formato inválido",
            error: "La fecha debe estar en formato YYYY-MM-DD (ej: 2025-01-15)",
          };
          cell.numFmt = "@"; // Formato de texto
        }
      });
  });

  // Validación de números (valores positivos)
  [
    "valor_reserva",
    "porcentaje_punta_compradora",
    "porcentaje_punta_vendedora",
    "porcentaje_honorarios_broker",
    "monto_sobre_reserva",
    "monto_sobre_refuerzo",
    "porcentaje_compartido",
    "porcentaje_referido",
    "porcentaje_honorarios_asesor",
    "porcentaje_honorarios_asesor_adicional",
    "gastos_operacion",
  ].forEach((colKey) => {
    worksheet
      .getColumn(colKey)
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1) {
          cell.dataValidation = {
            type: "decimal",
            operator: "greaterThanOrEqual",
            formulae: [0],
            allowBlank:
              colKey !== "valor_reserva" &&
              colKey !== "porcentaje_punta_compradora",
            showErrorMessage: true,
            errorTitle: "Valor inválido",
            error: "El valor debe ser un número mayor o igual a 0.",
          };
        }
      });
  });

  // Agregar una sola fila de ejemplo en la línea 2
  const exampleRow = {
    fecha_reserva: "2025-01-15",
    direccion_reserva: "Av. Corrientes 1234",
    tipo_operacion: "Venta",
    valor_reserva: 150000,
    estado: "En Curso",
    porcentaje_punta_compradora: 3,
    porcentaje_punta_vendedora: 3,
    punta_compradora: "TRUE",
    punta_vendedora: "TRUE",
    tipo_inmueble: "Departamentos",
    fecha_operacion: "2025-01-20",
    fecha_captacion: "2025-01-10",
    numero_casa: "5to A",
    localidad_reserva: "Buenos Aires",
    provincia_reserva: "CABA",
    porcentaje_honorarios_broker: 6,
    exclusiva: "TRUE",
    no_exclusiva: "FALSE",
    numero_sobre_reserva: "001",
    numero_sobre_refuerzo: "002",
    monto_sobre_reserva: 5000,
    monto_sobre_refuerzo: 10000,
    referido: "Juan Pérez",
    compartido: "Inmobiliaria ABC",
    porcentaje_compartido: 0.5,
    porcentaje_referido: 10,
    realizador_venta: "maria@example.com",
    porcentaje_honorarios_asesor: 40,
    realizador_venta_adicional: "pedro@example.com",
    porcentaje_honorarios_asesor_adicional: 20,
    observaciones: "Operación de ejemplo - puedes eliminar esta fila",
    pais: "Argentina",
    gastos_operacion: 1500,
    captacion_no_es_mia: "FALSE",
  };

  worksheet.addRow(exampleRow);

  // Congelar la primera fila (encabezado)
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  // Guardar el archivo
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, "plantilla_operaciones.xlsx");
  await workbook.xlsx.writeFile(filePath);

  console.log(`✅ Plantilla Excel generada exitosamente en: ${filePath}`);
}

// Ejecutar el script
generateTemplate().catch((error) => {
  console.error("❌ Error al generar la plantilla:", error);
  process.exit(1);
});
