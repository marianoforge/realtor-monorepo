import React, { useState } from "react";

import { Operation } from "@gds-si/shared-types";
import { OfficeData } from "@/common/hooks/useGetOfficesData";

import OperationsSummaryTable from "./OperationsSummaryTable";
import OperationsDetailTable from "./OperationsDetailTable";
import Pagination from "./Pagination";

interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

interface OfficeCardProps {
  teamId: string;
  operations: Operation[];
  officeData: OfficeData;
  operationsSummaries: OperationSummary[];
  getOfficeName: (teamId: string) => string;
  onOperationClick: (operation: Operation) => void;
  ITEMS_PER_PAGE: number;
}

const OfficeCard: React.FC<OfficeCardProps> = ({
  teamId,
  operations,
  officeData,
  operationsSummaries,
  getOfficeName,
  onOperationClick,
  ITEMS_PER_PAGE,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(operations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOperations = operations.slice(startIndex, endIndex);

  return (
    <div className="border rounded-lg overflow-hidden shadow">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-xl font-semibold">
          Oficina: {getOfficeName(teamId)}
        </h2>
        <div className="flex items-center text-sm text-gray-600">
          <span>{operations.length} operaciones encontradas</span>
          <button
            onClick={toggleExpansion}
            className="ml-2 text-[#0077b6] hover:text-[#0077b6]/80 underline focus:outline-none"
          >
            {isExpanded ? "Ocultar operaciones" : "Ver todas las operaciones"}
          </button>
        </div>
      </div>

      <OperationsSummaryTable summaries={operationsSummaries} />

      {isExpanded && (
        <>
          <OperationsDetailTable
            operations={paginatedOperations}
            teamId={teamId}
            officeData={officeData}
            onOperationClick={onOperationClick}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default OfficeCard;
