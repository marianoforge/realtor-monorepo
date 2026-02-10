import React from "react";

import { TeamMember } from "../types";

interface TeamMembersWithoutOperationsProps {
  teamMembersWithoutOperations: TeamMember[];
}

const TeamMembersWithoutOperations: React.FC<
  TeamMembersWithoutOperationsProps
> = ({ teamMembersWithoutOperations }) => {
  if (teamMembersWithoutOperations.length === 0) {
    return null;
  }

  const registeredMembers = teamMembersWithoutOperations.filter(
    (member) => member.advisorUid
  );
  const unregisteredMembers = teamMembersWithoutOperations.filter(
    (member) => !member.advisorUid
  );

  return (
    <div className="mt-10 space-y-8">
      {/* Tabla de asesores registrados sin operaciones */}
      {registeredMembers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Asesores registrados sin operaciones
          </h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-300">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    ID Usuario
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registeredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                          "No especificado"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {member.email || "No especificado"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {member.advisorUid || "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de asesores no registrados */}
      {unregisteredMembers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Asesores no registrados</h2>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-300">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unregisteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {`${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                          "No especificado"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {member.email || "No especificado"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersWithoutOperations;
