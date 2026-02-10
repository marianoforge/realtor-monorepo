"use client";

import { useState } from "react";

import { useGetOfficesData } from "@/common/hooks/useGetOfficesData";
import { Operation } from "@gds-si/shared-types";

import { useOfficeCalculations } from "./hooks/useOfficeCalculations";
import { OperationDetailsModal, GlobalSummary, OfficeCard } from "./components";

const OfficeAdmin = () => {
  const { officeOperations, officeData, isLoading, error, refetch } =
    useGetOfficesData();

  const { getOperationsSummaryByType, globalSummary, officeGroups } =
    useOfficeCalculations(officeOperations, officeData);

  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const openOperationDetails = (operation: Operation) => {
    setSelectedOperation(operation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOperation(null);
  };

  const getOfficeName = (teamId: string) => {
    return officeData[teamId]?.office || teamId;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message}</span>
        <button
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          onClick={() => refetch()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Administración de Oficinas</h1>

      <GlobalSummary
        totalValue={globalSummary.totalValue}
        totalGrossFees={globalSummary.totalGrossFees}
        totalNetFees={globalSummary.totalNetFees}
        totalOperations={globalSummary.totalOperations}
        officeCount={globalSummary.officeCount}
      />

      {officeOperations.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded text-center">
          No se encontraron operaciones para las oficinas.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {Object.entries(officeGroups).map(([teamId, operations]) => {
            const typedOperations = operations as Operation[];
            const operationsSummaries = getOperationsSummaryByType(
              typedOperations,
              teamId
            );

            return (
              <OfficeCard
                key={teamId}
                teamId={teamId}
                operations={typedOperations}
                officeData={officeData}
                operationsSummaries={operationsSummaries}
                getOfficeName={getOfficeName}
                onOperationClick={openOperationDetails}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              />
            );
          })}
        </div>
      )}

      {selectedOperation && (
        <OperationDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          operation={selectedOperation}
        />
      )}
    </div>
  );
};

export default OfficeAdmin;
