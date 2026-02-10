import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";

interface EscenariosCalculoPageProps {
  htmlContent: string;
}

const EscenariosCalculoPage = ({ htmlContent }: EscenariosCalculoPageProps) => {
  const handlePrint = () => {
    window.print();
  };

  // Extraer solo el contenido del body
  const bodyContent = htmlContent
    .replace(/^[\s\S]*?<body[^>]*>/, "")
    .replace(/<\/body>[\s\S]*$/, "");

  return (
    <PrivateRoute>
      <Head>
        <title>Escenarios de Cálculo del Neto - Realtor Trackpro</title>
        <meta
          name="description"
          content="Documentación completa de todos los escenarios de cálculo del neto en operaciones inmobiliarias"
        />
      </Head>
      <PrivateLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Botón de impresión */}
          <div className="mb-6 flex justify-end print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Imprimir / Guardar como PDF
            </button>
          </div>

          {/* Alerta informativa Argentina */}
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg flex items-start gap-3 print:hidden">
            <svg
              className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800">
                Importante para Argentina
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                En Argentina, la franquicia se le cobra{" "}
                <strong>únicamente al broker</strong>, no a los asesores. En el
                resto de los paises se saca del bruto final para luego dividirlo
                entre los participantes de la operación.
              </p>
            </div>
          </div>

          {/* Contenedor del contenido */}
          <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            <style jsx global>{`
              /* Estilos base del documento */
              @media print {
                @page {
                  margin: 2.5cm;
                }

                body {
                  background: white;
                }

                .print\\:hidden {
                  display: none !important;
                }

                /* Asegurar que los colores se impriman */
                * {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }

              /* Estilos del contenido */
              .escenarios-content {
                font-family:
                  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  "Helvetica Neue", Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }

              .escenarios-content code {
                white-space: pre-wrap;
              }

              .escenarios-content h1 {
                font-size: 2.5em;
                margin-bottom: 1em;
                color: #1a1a1a;
                border-bottom: 3px solid #4a9eff;
                padding-bottom: 0.5em;
              }

              .escenarios-content h2 {
                margin-top: 2.5em;
                margin-bottom: 1em;
                padding-top: 1em;
                border-top: 3px solid #4a9eff;
                padding-left: 0.5em;
                padding-right: 0.5em;
                background-color: #f0f7ff;
                border-radius: 5px;
                font-size: 1.8em;
              }

              .escenarios-content h3 {
                margin-top: 2em;
                margin-bottom: 0.8em;
                padding-left: 0.5em;
                color: #2c5aa0;
                font-size: 1.3em;
              }

              .escenarios-content h4 {
                margin-top: 1.5em;
                margin-bottom: 0.6em;
                padding-left: 0.5em;
                color: #4a7ba7;
                font-size: 1.1em;
              }

              /* Estilos para escenarios en la sección descriptiva */
              .escenarios-content h3[id^="escenario-"] {
                margin-top: 2.5em;
                margin-bottom: 1em;
                padding: 1.2em 1em 1.2em 1.5em;
                background-color: #ffffff;
                border: 1px solid #dee2e6;
                border-left: 4px solid #6c757d;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                font-size: 1.4em;
                font-weight: bold;
              }

              .escenarios-content h3[id^="escenario-"] + ul {
                margin-bottom: 2em;
                padding: 1em 1em 1em 2em;
                background-color: #f8f9fa;
                border-radius: 3px;
                border-left: 2px solid #e9ecef;
                font-size: 0.95em;
              }

              .escenarios-content
                h3[id^="escenario-"]:not(:first-of-type)::before {
                content: "";
                display: block;
                height: 1px;
                background: linear-gradient(
                  to right,
                  transparent,
                  #dee2e6,
                  transparent
                );
                margin: -1em 0 1.5em 0;
              }

              .escenarios-content h3[id*="escenario-1"] {
                border-left-color: #007bff;
              }

              .escenarios-content h3[id*="escenario-2"] {
                border-left-color: #28a745;
              }

              .escenarios-content h3[id*="escenario-3"] {
                border-left-color: #ffc107;
              }

              .escenarios-content h3[id*="escenario-4"] {
                border-left-color: #dc3545;
              }

              .escenarios-content h3[id*="escenario-5"] {
                border-left-color: #6f42c1;
              }

              .escenarios-content h3[id*="escenario-6"] {
                border-left-color: #fd7e14;
              }

              /* Separación entre grupos de ejemplos numéricos */
              .escenarios-content h3#grupo-1-sin-asesores-solo-team-leader-1,
              .escenarios-content h3#grupo-2-un-asesor-no-es-team-leader-1,
              .escenarios-content
                h3#grupo-3-un-asesor-el-team-leader-es-el-asesor-1,
              .escenarios-content
                h3#grupo-4-dos-asesores-ninguno-es-team-leader-1,
              .escenarios-content
                h3#grupo-5-dos-asesores-team-leader-es-asesor-principal-1,
              .escenarios-content
                h3#grupo-6-dos-asesores-team-leader-es-asesor-adicional-1 {
                margin-top: 3em;
                padding: 1em;
                background-color: #e8f4fd;
                border-left: 5px solid #4a9eff;
                border-radius: 5px;
              }

              /* Estilos para los escenarios con ejemplos numéricos */
              .escenarios-content h4[id^="escenario-"] {
                margin-top: 2em;
                margin-bottom: 1em;
                padding: 1.2em 1em 1.2em 1.5em;
                background-color: #ffffff;
                border: 1px solid #dee2e6;
                border-left: 4px solid #28a745;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                font-size: 1.3em;
                font-weight: bold;
              }

              .escenarios-content
                h4[id^="escenario-"]:not(:first-of-type)::before {
                content: "";
                display: block;
                height: 1px;
                background: linear-gradient(
                  to right,
                  transparent,
                  #dee2e6,
                  transparent
                );
                margin: -1em 0 1.5em 0;
              }

              .escenarios-content h4[id*="escenario-1"] {
                border-left-color: #007bff;
              }

              .escenarios-content h4[id*="escenario-2"] {
                border-left-color: #28a745;
              }

              .escenarios-content h4[id*="escenario-3"] {
                border-left-color: #ffc107;
              }

              .escenarios-content h4[id*="escenario-4"] {
                border-left-color: #dc3545;
              }

              .escenarios-content h4[id*="escenario-5"] {
                border-left-color: #6f42c1;
              }

              .escenarios-content h4[id*="escenario-6"] {
                border-left-color: #fd7e14;
              }

              .escenarios-content h4[id^="escenario-"] ~ p,
              .escenarios-content h4[id^="escenario-"] ~ ol {
                margin-left: 1em;
                margin-right: 1em;
                font-size: 0.95em;
              }

              .escenarios-content h4[id^="escenario-"] + p strong {
                font-size: 0.9em;
                font-weight: 600;
              }

              /* Estilos para enlaces a ejemplos */
              .escenarios-content a.ejemplo-link {
                color: #4a9eff;
                text-decoration: none;
                font-size: 0.85em;
                margin-left: 0.5em;
                font-weight: normal;
              }

              .escenarios-content a.ejemplo-link:hover {
                text-decoration: underline;
                color: #2c5aa0;
              }

              .escenarios-content a.ejemplo-link::before {
                content: "📊 ";
              }

              .escenarios-content ul li {
                margin-bottom: 0.3em;
              }

              .escenarios-content ol[type="1"] {
                background-color: #f8f9fa;
                padding: 1em 1em 1em 2.5em;
                border-radius: 5px;
                margin: 1em 0;
              }

              .escenarios-content hr {
                margin: 2em 0;
                border: none;
                border-top: 2px solid #dee2e6;
              }

              .escenarios-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1em 0;
              }

              .escenarios-content table th,
              .escenarios-content table td {
                padding: 0.75em;
                border: 1px solid #dee2e6;
                text-align: left;
              }

              .escenarios-content table th {
                background-color: #f8f9fa;
                font-weight: bold;
              }

              .escenarios-content table tr:nth-child(even) {
                background-color: #f8f9fa;
              }

              @media print {
                .escenarios-content {
                  font-size: 12pt;
                }

                .escenarios-content h1 {
                  font-size: 24pt;
                  page-break-after: avoid;
                }

                .escenarios-content h2 {
                  font-size: 18pt;
                  page-break-after: avoid;
                }

                .escenarios-content h3 {
                  font-size: 14pt;
                  page-break-after: avoid;
                }

                .escenarios-content h4 {
                  font-size: 12pt;
                  page-break-after: avoid;
                }

                .escenarios-content h3[id^="escenario-"],
                .escenarios-content h4[id^="escenario-"] {
                  page-break-inside: avoid;
                  page-break-after: avoid;
                }

                .escenarios-content ol,
                .escenarios-content ul {
                  page-break-inside: avoid;
                }

                .escenarios-content table {
                  page-break-inside: avoid;
                }
              }
            `}</style>

            <div
              className="escenarios-content"
              dangerouslySetInnerHTML={{ __html: bodyContent }}
            />
          </div>
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  let htmlContent = "";

  try {
    // Intentar leer desde docs/escenarios.html
    const filePath = path.join(process.cwd(), "docs", "escenarios.html");
    if (fs.existsSync(filePath)) {
      htmlContent = fs.readFileSync(filePath, "utf8");
    } else {
      // Fallback: intentar desde public si existe
      const publicPath = path.join(process.cwd(), "public", "escenarios.html");
      if (fs.existsSync(publicPath)) {
        htmlContent = fs.readFileSync(publicPath, "utf8");
      } else {
        // Si no existe, usar contenido vacío (se mostrará un mensaje)
        console.warn("No se encontró el archivo escenarios.html");
        htmlContent =
          "<p>Contenido no disponible. Por favor, contacta al administrador.</p>";
      }
    }
  } catch (error) {
    console.error("Error al leer escenarios.html:", error);
    htmlContent =
      "<p>Error al cargar el contenido. Por favor, intenta más tarde.</p>";
  }

  return {
    props: {
      htmlContent,
    },
  };
};

export default EscenariosCalculoPage;
