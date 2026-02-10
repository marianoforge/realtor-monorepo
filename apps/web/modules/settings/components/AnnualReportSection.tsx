import React from "react";
import Link from "next/link";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";

const AnnualReportSection: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
        <DocumentChartBarIcon className="w-8 h-8 text-purple-600" />
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Informe Anual
          </h3>
          <p className="text-sm text-gray-500">
            Visualiza un resumen completo de tus métricas anuales
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-gray-600 text-sm">
            Genera un informe detallado con todas tus métricas del año:
            honorarios, operaciones, exclusividad, evolución mensual y más.
            Puedes imprimirlo o descargarlo.
          </p>
        </div>
        <Link
          href="/annual-report"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
        >
          <DocumentChartBarIcon className="w-5 h-5" />
          Ver Informe Anual
        </Link>
      </div>
    </div>
  );
};

export default AnnualReportSection;
