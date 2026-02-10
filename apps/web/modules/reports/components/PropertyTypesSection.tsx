import React from "react";

interface PropertyType {
  type: string;
  count: number;
  percentage: number;
}

interface PropertyTypesSectionProps {
  propertyTypes: PropertyType[];
}

const PropertyTypesSection: React.FC<PropertyTypesSectionProps> = ({
  propertyTypes,
}) => {
  if (propertyTypes.length === 0) return null;

  return (
    <div className="p-6 border-x border-gray-200">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        🏠 Tipos de Inmueble Más Frecuentes
      </h3>
      <div className="flex flex-wrap gap-2">
        {propertyTypes.map((pt) => (
          <div
            key={pt.type}
            className="bg-gray-100 rounded-lg px-3 py-2 text-sm"
          >
            <span className="font-medium text-gray-800">{pt.type}</span>
            <span className="text-gray-500 ml-2">
              ({pt.count} - {pt.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyTypesSection;
