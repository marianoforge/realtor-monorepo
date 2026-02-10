import { Operation } from "@gds-si/shared-types";

export interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  advisorUid?: string;
}

export interface OperationSummary {
  tipo: string;
  totalValue: number;
  averagePuntas: number;
  totalGrossFees: number;
  totalNetFees: number;
  exclusivityPercentage: number;
  operationsCount: number;
}

export interface GlobalSummary {
  totalGrossFees: number;
  totalNetFees: number;
  totalOperations: number;
  teamMembersCount: number;
}

export interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
}

export interface FilterProps {
  yearFilter: string;
  setYearFilter: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  advisorFilter: string;
  setAdvisorFilter: (value: string) => void;
  advisorOptions: { label: string; value: string }[];
}

export interface TeamMemberSectionProps {
  agentId: string;
  operations: Operation[];
  teamMembers: TeamMember[];
  expandedAgents: Record<string, boolean>;
  currentPage: Record<string, number>;
  toggleAgentOperations: (agentId: string) => void;
  handlePageChange: (agentId: string, page: number) => void;
  openOperationDetails: (operation: Operation) => void;
}

export interface OperationSummaryTableProps {
  operationsSummaries: OperationSummary[];
}

export interface OperationDetailsTableProps {
  operations: Operation[];
  currentPageIndex: number;
  totalPages: number;
  agentId: string;
  handlePageChange: (agentId: string, page: number) => void;
  openOperationDetails: (operation: Operation) => void;
  getAgentName: (agentId: string) => string;
}
