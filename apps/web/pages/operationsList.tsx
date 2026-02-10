import React from "react";

import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import OperationsTable from "@/modules/operations/OperationsTable";
import OperationsTableRent from "@/modules/operations/OperationsTableRent";

const OperationsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="flex flex-col gap-10">
          <OperationsTable />
          <OperationsTableRent />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default OperationsPage;
