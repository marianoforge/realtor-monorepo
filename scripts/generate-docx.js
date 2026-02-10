const fs = require("fs");
const path = require("path");

// Simple script to help convert markdown to docx
// This script provides instructions for conversion

const markdownFile = path.join(__dirname, "../DASHBOARD_METRICAS.md");
const outputFile = path.join(__dirname, "../DASHBOARD_METRICAS.docx");

console.log("📄 Dashboard Metrics Documentation Generator\n");
console.log("✅ Markdown file created at:", markdownFile);
console.log("\n📝 To convert to DOCX, you have several options:\n");

console.log("Option 1 - Using Pandoc (recommended):");
console.log("  Install: brew install pandoc (on macOS)");
console.log("  Or visit: https://pandoc.org/installing.html");
console.log("  Then run:");
console.log(`  pandoc DASHBOARD_METRICAS.md -o DASHBOARD_METRICAS.docx\n`);

console.log("Option 2 - Using online converter:");
console.log("  1. Open the file: DASHBOARD_METRICAS.md");
console.log("  2. Visit: https://cloudconvert.com/md-to-docx");
console.log("  3. Upload and convert\n");

console.log("Option 3 - Using Microsoft Word:");
console.log("  1. Open Microsoft Word");
console.log("  2. File > Open > Select DASHBOARD_METRICAS.md");
console.log("  3. File > Save As > Choose .docx format\n");

console.log("Option 4 - Using Google Docs:");
console.log("  1. Open Google Docs");
console.log("  2. File > Open > Upload tab");
console.log("  3. Upload DASHBOARD_METRICAS.md");
console.log("  4. File > Download > Microsoft Word (.docx)\n");

console.log("The markdown file is ready and formatted for easy conversion! 🚀");
