import { Operation, UserData } from "@gds-si/shared-types";
import { UserRole } from "./enums";
import { totalHonorariosTeamLead } from "./calculations";

export const calculateNetFees = (
  operation: Operation,
  userData: UserData | null
): number => {
  if (!userData) {
    return 0;
  }

  const userRole = userData.role ?? UserRole.DEFAULT; // Fallback to 'guest' if role is null
  return totalHonorariosTeamLead(operation, userRole as UserRole, userData);
};
