import React from "react";

import AgentsReport from "@/modules/agents/AgentsReport";
import { useUserDataStore } from "@/stores/userDataStore";
import AgentsReportCarousel from "@/modules/agents/AgentsReportCarousel";
import AgentsReportByOps from "@/modules/agents/AgentsReportByOps";
import PrivateRoute from "@/components/PrivateComponente/PrivateRoute";
import PrivateLayout from "@/components/PrivateComponente/PrivateLayout";
import { UserRole } from "@gds-si/shared-utils";
import AgentsLists from "@/modules/agents/AgentsLists";

const Agents = () => {
  const { userData } = useUserDataStore();
  return (
    <PrivateRoute requiredRole={UserRole.TEAM_LEADER_BROKER}>
      <PrivateLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {userData && (
            <>
              <div className="hidden lg:block mb-6">
                {userData && <AgentsReport userId={userData?.uid || ""} />}
              </div>

              {userData && (
                <div className="hidden lg:flex lg:flex-col xxl:flex-row lg:gap-3 xxl:gap-6">
                  <div className="lg:w-full xxl:w-1/2">
                    <AgentsReportByOps userId={userData?.uid || ""} />
                  </div>
                  <div className="lg:w-full xxl:w-1/2">
                    <AgentsLists userId={userData?.uid || ""} />
                  </div>
                </div>
              )}

              <div className="block lg:hidden px-2">
                {userData && (
                  <AgentsReportCarousel userId={userData?.uid || ""} />
                )}
              </div>
            </>
          )}
        </div>
      </PrivateLayout>
    </PrivateRoute>
  );
};

export default Agents;
