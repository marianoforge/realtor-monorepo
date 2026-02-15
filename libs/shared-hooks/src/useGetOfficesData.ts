import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { useAuthStore } from "@gds-si/shared-stores";
import { Operation, UserData } from "@gds-si/shared-types";

import { extractApiData } from "@gds-si/shared-utils";

export enum OfficeAdminQueryKeys {
  OFFICES_DATA = "officesData",
}

export interface OfficeData {
  [key: string]: {
    office: string;
    teamLeadData?: UserData;
    [key: string]: unknown;
  };
}

interface OfficesApiResponse {
  operations: Operation[];
  offices: OfficeData;
}

const fetchOfficesData = async (): Promise<OfficesApiResponse> => {
  const token = await useAuthStore.getState().getAuthToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const response = await axios.get("/api/officeAdmin/getOfficesData", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload =
    extractApiData<OfficesApiResponse>(response.data) ?? response.data;
  return {
    operations: payload.operations || [],
    offices: payload.offices || {},
  };
};

export const useGetOfficesData = () => {
  const { userID } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [OfficeAdminQueryKeys.OFFICES_DATA],
    queryFn: fetchOfficesData,
    enabled: !!userID,
  });

  return {
    officeOperations: data?.operations || [],
    officeData: data?.offices || {},
    isLoading,
    error,
    refetch,
  };
};
