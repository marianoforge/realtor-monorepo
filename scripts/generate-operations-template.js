/**
 * Script para generar la plantilla de operaciones con headers amigables
 * Incluye: colores en columnas obligatorias y data validation (dropdowns)
 *
 * Ejecutar con: node scripts/generate-operations-template.js
 */

const ExcelJS = require("exceljs");
const path = require("path");

// Tipos de operación válidos (del formulario)
const OPERATION_TYPES = [
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

// Estados válidos (del formulario)
const VALID_STATES = ["En Curso", "Cerrada", "Caída"];

// Tipos de inmueble válidos (del formulario)
const PROPERTY_TYPES = [
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

// Valores SI/NO para booleanos
const BOOLEAN_VALUES = ["SI", "NO"];

// Headers amigables (labels del formulario) con sus valores de ejemplo
// Las primeras 6 columnas (A-F) son obligatorias
const OPERATION_HEADERS = [
  // OBLIGATORIOS (A-F) - Se pintarán
  {
    label: "Fecha de Reserva*",
    example: "15-01-2025",
    required: true,
    type: "date",
  },
  {
    label: "Dirección*",
    example: "Av. Corrientes 1234",
    required: true,
    type: "text",
  },
  {
    label: "Tipo de Operación*",
    example: "Venta",
    required: true,
    type: "dropdown",
    options: OPERATION_TYPES,
  },
  {
    label: "Valor de Reserva*",
    example: "150000",
    required: true,
    type: "number",
  },
  {
    label: "Estado*",
    example: "En Curso",
    required: true,
    type: "dropdown",
    options: VALID_STATES,
  },
  { label: "% Punta Vendedora*", example: "3", required: true, type: "number" },
  // OPCIONALES
  {
    label: "% Punta Compradora",
    example: "3",
    required: false,
    type: "number",
  },
  {
    label: "Punta Compradora",
    example: "SI",
    required: false,
    type: "dropdown",
    options: BOOLEAN_VALUES,
  },
  {
    label: "Punta Vendedora",
    example: "SI",
    required: false,
    type: "dropdown",
    options: BOOLEAN_VALUES,
  },
  {
    label: "Tipo de Inmueble",
    example: "Departamentos",
    required: false,
    type: "dropdown",
    options: PROPERTY_TYPES,
  },
  {
    label: "Fecha de Cierre",
    example: "28-02-2025",
    required: false,
    type: "date",
  },
  {
    label: "Fecha de Captación",
    example: "01-12-2024",
    required: false,
    type: "date",
  },
  { label: "Nro Casa", example: "5B", required: false, type: "text" },
  {
    label: "Localidad",
    example: "Capital Federal",
    required: false,
    type: "text",
  },
  {
    label: "Provincia",
    example: "Buenos Aires",
    required: false,
    type: "text",
  },
  { label: "País", example: "Argentina", required: false, type: "text" },
  {
    label: "% Honorarios Broker",
    example: "4",
    required: false,
    type: "number",
  },
  {
    label: "Exclusiva",
    example: "SI",
    required: false,
    type: "dropdown",
    options: BOOLEAN_VALUES,
  },
  {
    label: "No Exclusiva",
    example: "NO",
    required: false,
    type: "dropdown",
    options: BOOLEAN_VALUES,
  },
  {
    label: "Nro Sobre Reserva",
    example: "12345",
    required: false,
    type: "text",
  },
  {
    label: "Nro Sobre Refuerzo",
    example: "67890",
    required: false,
    type: "text",
  },
  {
    label: "Monto Sobre Reserva",
    example: "5000",
    required: false,
    type: "number",
  },
  {
    label: "Monto Sobre Refuerzo",
    example: "3000",
    required: false,
    type: "number",
  },
  { label: "Referido", example: "", required: false, type: "text" },
  { label: "Compartido", example: "", required: false, type: "text" },
  { label: "% Compartido", example: "", required: false, type: "number" },
  { label: "% Referido", example: "", required: false, type: "number" },
  {
    label: "Asesor (Email)",
    example: "asesor@email.com",
    required: false,
    type: "text",
  },
  {
    label: "% Honorarios Asesor",
    example: "50",
    required: false,
    type: "number",
  },
  {
    label: "Asesor Adicional (Email)",
    example: "",
    required: false,
    type: "text",
  },
  {
    label: "% Honorarios Asesor Adicional",
    example: "",
    required: false,
    type: "number",
  },
  { label: "Notas", example: "", required: false, type: "text" },
  {
    label: "Gastos de Operación",
    example: "",
    required: false,
    type: "number",
  },
  {
    label: "Captación no es mía",
    example: "NO",
    required: false,
    type: "dropdown",
    options: BOOLEAN_VALUES,
  },
];

// Colores para estilos
const REQUIRED_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF2CC" }, // Amarillo claro
};

const REQUIRED_HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFD966" }, // Amarillo más intenso
};

const OPTIONAL_HEADER_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFE2EFDA" }, // Verde claro
};

const HEADER_FONT = {
  bold: true,
  size: 11,
  color: { argb: "FF000000" },
};

const HEADER_BORDER = {
  top: { style: "thin", color: { argb: "FF999999" } },
  left: { style: "thin", color: { argb: "FF999999" } },
  bottom: { style: "medium", color: { argb: "FF666666" } },
  right: { style: "thin", color: { argb: "FF999999" } },
};

const CELL_BORDER = {
  top: { style: "thin", color: { argb: "FFCCCCCC" } },
  left: { style: "thin", color: { argb: "FFCCCCCC" } },
  bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
  right: { style: "thin", color: { argb: "FFCCCCCC" } },
};

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RealtorTrackPro";
  workbook.created = new Date();

  // === HOJA 1: OPERACIONES ===
  const wsOperaciones = workbook.addWorksheet("Operaciones", {
    properties: { tabColor: { argb: "FF0077B6" } },
  });

  // Configurar columnas
  wsOperaciones.columns = OPERATION_HEADERS.map((h, index) => ({
    header: h.label,
    key: `col_${index}`,
    width: Math.max(h.label.length + 4, 20),
  }));

  // Estilizar encabezados (fila 1)
  const headerRow = wsOperaciones.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell, colNumber) => {
    const header = OPERATION_HEADERS[colNumber - 1];
    cell.fill = header.required ? REQUIRED_HEADER_FILL : OPTIONAL_HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.border = HEADER_BORDER;
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
  });

  // Agregar fila de ejemplo (fila 2)
  const exampleData = OPERATION_HEADERS.map((h) => h.example);
  wsOperaciones.addRow(exampleData);

  // Estilizar fila de ejemplo
  const exampleRow = wsOperaciones.getRow(2);
  exampleRow.eachCell((cell, colNumber) => {
    const header = OPERATION_HEADERS[colNumber - 1];
    if (header.required) {
      cell.fill = REQUIRED_FILL;
    }
    cell.border = CELL_BORDER;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  // Agregar filas vacías adicionales con formato (para que el usuario vea el patrón)
  for (let i = 3; i <= 100; i++) {
    const row = wsOperaciones.getRow(i);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= OPERATION_HEADERS.length) {
        const header = OPERATION_HEADERS[colNumber - 1];
        if (header.required) {
          cell.fill = REQUIRED_FILL;
        }
        cell.border = CELL_BORDER;
      }
    });
    // Forzar que las celdas vacías tengan el formato
    for (let j = 1; j <= 6; j++) {
      const cell = row.getCell(j);
      cell.fill = REQUIRED_FILL;
      cell.border = CELL_BORDER;
    }
  }

  // Función para convertir índice de columna a letra (0=A, 1=B, ... 26=AA, etc.)
  function getColumnLetter(index) {
    let letter = "";
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  // Agregar Data Validation (dropdowns) - solo para las primeras 26 columnas que tienen dropdown
  OPERATION_HEADERS.forEach((header, index) => {
    if (header.type === "dropdown" && header.options && index < 26) {
      const colLetter = getColumnLetter(index);
      // Crear la fórmula con las opciones
      const optionsFormula = `"${header.options.join(",")}"`;

      // Aplicar validación a las filas 2-100 (rango más pequeño para evitar problemas)
      for (let row = 2; row <= 100; row++) {
        const cell = wsOperaciones.getCell(`${colLetter}${row}`);
        cell.dataValidation = {
          type: "list",
          allowBlank: !header.required,
          formulae: [optionsFormula],
          showErrorMessage: true,
          errorStyle: "error",
          errorTitle: "Valor inválido",
          error: `Seleccione un valor válido`,
        };
      }
    }
  });

  // Congelar la primera fila
  wsOperaciones.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

  // === HOJA 2: INSTRUCCIONES ===
  const wsInstrucciones = workbook.addWorksheet("Instrucciones", {
    properties: { tabColor: { argb: "FF28A745" } },
  });

  wsInstrucciones.columns = [{ width: 70 }];

  const instructions = [
    {
      text: "═══════════════════════════════════════════════════════════",
      style: "divider",
    },
    {
      text: "          INSTRUCCIONES PARA IMPORTAR OPERACIONES          ",
      style: "title",
    },
    {
      text: "═══════════════════════════════════════════════════════════",
      style: "divider",
    },
    { text: "", style: "normal" },
    { text: "📋 PASOS PARA IMPORTAR:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    {
      text: '1. Complete la hoja "Operaciones" con sus datos',
      style: "normal",
    },
    {
      text: "2. Las columnas A hasta F (en amarillo) son OBLIGATORIAS",
      style: "normal",
    },
    {
      text: "3. Guarde el archivo y súbalo desde Configuración > Importar",
      style: "normal",
    },
    { text: "", style: "normal" },
    {
      text: "🎨 COLUMNAS OBLIGATORIAS (A-F) - Pintadas en amarillo:",
      style: "section",
    },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    { text: "   A - Fecha de Reserva*", style: "normal" },
    { text: "   B - Dirección*", style: "normal" },
    { text: "   C - Tipo de Operación* (dropdown)", style: "normal" },
    { text: "   D - Valor de Reserva*", style: "normal" },
    { text: "   E - Estado* (dropdown)", style: "normal" },
    { text: "   F - % Punta Vendedora*", style: "normal" },
    { text: "", style: "normal" },
    { text: "📅 FORMATO DE FECHAS:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    {
      text: "   • Formato preferido: DD-MM-AAAA (ejemplo: 15-01-2025)",
      style: "normal",
    },
    { text: "   • También acepta: DD/MM/AAAA o AAAA-MM-DD", style: "normal" },
    { text: "", style: "normal" },
    { text: "💰 FORMATO DE NÚMEROS:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    {
      text: "   • Valores monetarios: números sin símbolos ($, €)",
      style: "normal",
    },
    {
      text: "   • Porcentajes: sin el símbolo % (ejemplo: 3 para 3%)",
      style: "normal",
    },
    { text: "", style: "normal" },
    { text: "📝 CAMPOS CON LISTA DESPLEGABLE:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    { text: "", style: "normal" },
    { text: "   TIPO DE OPERACIÓN:", style: "subsection" },
    ...OPERATION_TYPES.map((t) => ({ text: `      • ${t}`, style: "list" })),
    { text: "", style: "normal" },
    { text: "   ESTADO:", style: "subsection" },
    ...VALID_STATES.map((s) => ({ text: `      • ${s}`, style: "list" })),
    { text: "", style: "normal" },
    { text: "   TIPO DE INMUEBLE:", style: "subsection" },
    ...PROPERTY_TYPES.map((p) => ({ text: `      • ${p}`, style: "list" })),
    { text: "", style: "normal" },
    { text: "   CAMPOS SI/NO (seleccionar SI o NO):", style: "subsection" },
    { text: "      • Punta Compradora", style: "list" },
    { text: "      • Punta Vendedora", style: "list" },
    { text: "      • Exclusiva", style: "list" },
    { text: "      • No Exclusiva", style: "list" },
    { text: "      • Captación no es mía", style: "list" },
    { text: "", style: "normal" },
    { text: "👥 ASESORES:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    {
      text: "   • Use el email del asesor registrado en el sistema",
      style: "normal",
    },
    {
      text: "   • El sistema buscará automáticamente al asesor",
      style: "normal",
    },
    { text: "", style: "normal" },
    { text: "⚠️ IMPORTANTE:", style: "section" },
    {
      text: "────────────────────────────────────────────────────────────",
      style: "line",
    },
    { text: "   • Máximo 1000 operaciones por importación", style: "normal" },
    {
      text: "   • La fila de ejemplo (fila 2) puede eliminarse o editarse",
      style: "normal",
    },
    { text: "   • Las filas vacías serán ignoradas", style: "normal" },
    {
      text: "   • Los dropdowns muestran las opciones válidas al hacer clic",
      style: "normal",
    },
    { text: "", style: "normal" },
    {
      text: "═══════════════════════════════════════════════════════════",
      style: "divider",
    },
  ];

  instructions.forEach((instruction, index) => {
    const row = wsInstrucciones.addRow([instruction.text]);
    const cell = row.getCell(1);

    switch (instruction.style) {
      case "title":
        cell.font = { bold: true, size: 14, color: { argb: "FF0077B6" } };
        cell.alignment = { horizontal: "center" };
        break;
      case "section":
        cell.font = { bold: true, size: 12, color: { argb: "FF333333" } };
        break;
      case "subsection":
        cell.font = { bold: true, size: 11, color: { argb: "FF555555" } };
        break;
      case "divider":
      case "line":
        cell.font = { color: { argb: "FF999999" } };
        break;
      case "list":
        cell.font = { size: 10, color: { argb: "FF666666" } };
        break;
      default:
        cell.font = { size: 11, color: { argb: "FF333333" } };
    }
  });

  // Guardar archivo
  const outputPath = path.join(
    __dirname,
    "../public/plantilla_operaciones.xlsx"
  );
  await workbook.xlsx.writeFile(outputPath);

  console.log("✅ Plantilla generada exitosamente en:", outputPath);
  console.log("");
  console.log("📋 Características de la plantilla:");
  console.log("════════════════════════════════════════════════════════");
  console.log("");
  console.log("🎨 COLUMNAS OBLIGATORIAS (A-F) - Pintadas en amarillo:");
  OPERATION_HEADERS.slice(0, 6).forEach((h, i) => {
    const col = String.fromCharCode(65 + i);
    const dropdownInfo = h.type === "dropdown" ? " 🔽" : "";
    console.log(`   ${col}. ${h.label}${dropdownInfo}`);
  });
  console.log("");
  console.log("📝 COLUMNAS CON DROPDOWN:");
  OPERATION_HEADERS.forEach((h, i) => {
    if (h.type === "dropdown") {
      const col = String.fromCharCode(65 + i);
      console.log(`   ${col}. ${h.label}: [${h.options.join(", ")}]`);
    }
  });
  console.log("");
  console.log("════════════════════════════════════════════════════════");
}

generateTemplate().catch(console.error);
