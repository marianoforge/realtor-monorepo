import React from "react";

interface ReportFooterProps {
  year: number;
}

const ReportFooter: React.FC<ReportFooterProps> = ({ year }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-b-2xl print:rounded-none border-x border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-600">
        <div>
          <p className="font-medium text-gray-800">Realtor TrackPro</p>
          <p>Informe generado automáticamente</p>
        </div>
        <div className="text-right">
          <p>Este informe corresponde al año fiscal {year}</p>
          <p className="text-xs text-gray-400 mt-1">
            Los datos mostrados son estimados y pueden variar según ajustes
            posteriores
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportFooter;
