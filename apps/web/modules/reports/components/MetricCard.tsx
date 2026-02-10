import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  subtitle?: string;
}

// Mapeo de colores de texto a colores de fondo (Tailwind necesita clases estáticas)
const colorBgMap: Record<string, string> = {
  "text-emerald-600": "bg-emerald-100",
  "text-blue-600": "bg-blue-100",
  "text-green-600": "bg-green-100",
  "text-purple-600": "bg-purple-100",
  "text-amber-600": "bg-amber-100",
  "text-amber-500": "bg-amber-100",
  "text-indigo-600": "bg-indigo-100",
  "text-cyan-600": "bg-cyan-100",
  "text-orange-600": "bg-orange-100",
  "text-red-600": "bg-red-100",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) => {
  const bgColor = colorBgMap[color] || "bg-gray-100";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
