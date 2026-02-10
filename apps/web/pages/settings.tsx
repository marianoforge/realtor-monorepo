import React from "react";

import Settings from "@/modules/settings/Settings";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";

const SettingsPage = () => {
  return (
    <PrivateRoute>
      <PrivateLayout>
        <Settings />
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default SettingsPage;
