import React from "react";

interface ReportHeaderProps {
  year: number;
  quarter: number | null;
  userName: string;
  userAgency: string;
  generatedAt: string;
}

const QUARTER_LABELS: Record<number, string> = {
  1: "Q1 (Ene-Mar)",
  2: "Q2 (Abr-Jun)",
  3: "Q3 (Jul-Sep)",
  4: "Q4 (Oct-Dic)",
};

const ReportHeader: React.FC<ReportHeaderProps> = ({
  year,
  quarter,
  userName,
  userAgency,
  generatedAt,
}) => {
  const periodLabel = quarter
    ? `${year} - ${QUARTER_LABELS[quarter]}`
    : `${year}`;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 rounded-t-2xl print:rounded-none">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            📊 Informe {quarter ? "Trimestral" : "Anual"} {periodLabel}
          </h1>
          <p className="text-blue-100 text-lg">{userName}</p>
          <p className="text-blue-200 text-sm">{userAgency}</p>
        </div>
        <div className="text-right">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <p className="text-xs text-blue-200">Generado el</p>
            <p className="text-sm font-medium">{generatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
