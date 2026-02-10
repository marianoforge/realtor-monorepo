import React from "react";

interface ExpensesPaginationProps {
  currentPage: number;
  totalPages: number;
  currentItemsCount: number;
  disablePagination: boolean;
  onPageChange: (page: number) => void;
}

const ExpensesPagination: React.FC<ExpensesPaginationProps> = ({
  currentPage,
  totalPages,
  currentItemsCount,
  disablePagination,
  onPageChange,
}) => {
  if (totalPages === 0) {
    return currentItemsCount === 0 ? (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          No se encontraron gastos con los filtros aplicados.
        </p>
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center mt-6 mb-4 space-y-2 sm:space-y-0">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disablePagination}
        className="px-4 py-2 mx-1 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors duration-200 shadow-sm"
      >
        Anterior
      </button>
      <span className="px-4 py-2 mx-1 text-sm text-gray-600">
        Página {currentPage} de {totalPages}
        {currentItemsCount > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            ({currentItemsCount} resultados)
          </span>
        )}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disablePagination}
        className="px-4 py-2 mx-1 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors duration-200 shadow-sm"
      >
        Siguiente
      </button>
    </div>
  );
};

export default ExpensesPagination;
