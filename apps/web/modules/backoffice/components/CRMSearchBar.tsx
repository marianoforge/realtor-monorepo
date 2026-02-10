import React from "react";

interface CRMSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalFiltered: number;
  totalUsers: number;
  hasFilters: boolean;
  onClearAllFilters: () => void;
}

const CRMSearchBar: React.FC<CRMSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  totalFiltered,
  totalUsers,
  hasFilters,
  onClearAllFilters,
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, email, teléfono o agencia..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600">
          Mostrando {totalFiltered} de {totalUsers} usuarios
          {hasFilters && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Filtrado
            </span>
          )}
        </p>
        {hasFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default CRMSearchBar;
