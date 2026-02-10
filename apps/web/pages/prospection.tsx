import React from "react";

import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import ProspectionMain from "@/modules/prospection/ProspectionMain";

const ProspectionPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <div className="flex flex-col gap-6 md:gap-10">
          <ProspectionMain />
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default ProspectionPage;
