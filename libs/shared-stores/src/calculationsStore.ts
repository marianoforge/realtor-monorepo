import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

import {
  calculateTotalHonorariosBroker,
  totalHonorariosTeamLead,
} from "@gds-si/shared-utils";
import { Operation, UserData } from "@gds-si/shared-types";
import { OperationStatus, UserRole } from "@gds-si/shared-utils";
import { getOperationYear } from "@gds-si/shared-utils";
import { getEffectiveYear } from "@gds-si/shared-utils";

// Interface for the state
interface CalculationsState {
  operations: Operation[];
  userData: UserData | null;
  userRole: UserRole | null;
  isLoading: boolean;
  error: string | null;
  currentUserID: string | null; // Add current user ID to track user changes
  results: {
    honorariosBrutos: number;
    honorariosNetos: number;
    honorariosBrutosEnCurso: number;
    honorariosNetosEnCurso: number;
    honorariosBrutosEnCursoTotal: number; // Suma de honorarios brutos en curso del año actual y anterior
  };
  lastCalculated: number; // timestamp of last calculation

  // Actions
  setOperations: (operations: Operation[]) => void;
  setUserData: (userData: UserData | null) => void;
  setUserRole: (role: UserRole | null) => void;
  setCurrentUserID: (userID: string | null) => void; // Add method to set current user
  resetStore: () => void; // Add method to reset store
  fetchOperations: (userID: string) => Promise<void>;
  calculateResults: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Filtros dinámicos
  calculateResultsByFilters: (
    yearFilter: string,
    statusFilter: string
  ) => {
    honorariosBrutos: number;
    honorariosNetos: number;
  };
}

export const useCalculationsStore = create<CalculationsState>()(
  persist(
    (set, get) => ({
      operations: [],
      userData: null,
      userRole: null,
      isLoading: false,
      error: null,
      currentUserID: null,
      lastCalculated: 0,
      results: {
        honorariosBrutos: 0,
        honorariosNetos: 0,
        honorariosBrutosEnCurso: 0,
        honorariosNetosEnCurso: 0,
        honorariosBrutosEnCursoTotal: 0, // Nuevo campo inicializado
      },

      setOperations: (operations) => {
        // Filtrar para excluir operaciones con estado CAIDA antes de guardarlas
        const operacionesValidas = operations.filter(
          (op) => op.estado !== OperationStatus.CAIDA
        );
        set({ operations: operacionesValidas });
      },

      setUserData: (userData) => set({ userData }),

      setUserRole: (role) => set({ userRole: role }),

      setCurrentUserID: (userID) => set({ currentUserID: userID }),

      resetStore: () => {
        set({
          operations: [],
          userData: null,
          userRole: null,
          isLoading: false,
          error: null,
          currentUserID: null,
          lastCalculated: 0,
          results: {
            honorariosBrutos: 0,
            honorariosNetos: 0,
            honorariosBrutosEnCurso: 0,
            honorariosNetosEnCurso: 0,
            honorariosBrutosEnCursoTotal: 0, // Reset del nuevo campo
          },
        });
      },

      fetchOperations: async (userID) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `/api/operations?user_uid=${userID}`
          );
          const fetchedOperations = response.data;

          // Filtrar para excluir operaciones con estado CAIDA
          const operacionesValidas = fetchedOperations.filter(
            (op: Operation) => op.estado !== OperationStatus.CAIDA
          );

          set({ operations: operacionesValidas });
          get().calculateResults(); // Calculate results after fetching operations
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      calculateResults: () => {
        const { operations, userData, userRole } = get();

        if (operations.length === 0 || !userData || !userRole) {
          // Reset results to 0 when there are no operations
          set({
            results: {
              honorariosBrutos: 0,
              honorariosNetos: 0,
              honorariosBrutosEnCurso: 0,
              honorariosNetosEnCurso: 0,
              honorariosBrutosEnCursoTotal: 0, // Reset del nuevo campo
            },
            lastCalculated: Date.now(),
          });
          return;
        }

        try {
          // Filtrar primero para excluir operaciones CAIDA
          const operacionesValidas = operations.filter(
            (op) => op.estado !== OperationStatus.CAIDA
          );

          // Obtener el año efectivo (2025 para demo, año actual para otros)
          const currentYear = getEffectiveYear(userData?.email);
          const previousYear = currentYear - 1;

          // Filter operations for the current year only
          // 🚀 NUEVO: Las operaciones "En Curso" siempre se asocian al año actual/efectivo
          const operationsCurrentYear = operacionesValidas.filter((op) => {
            return getOperationYear(op, currentYear) === currentYear;
          });

          // Filter operations for the previous year
          const operationsPreviousYear = operacionesValidas.filter((op) => {
            return getOperationYear(op, currentYear) === previousYear;
          });

          if (operationsCurrentYear.length === 0) {
            // Reset results to 0 when there are no operations for current year
            set({
              results: {
                honorariosBrutos: 0,
                honorariosNetos: 0,
                honorariosBrutosEnCurso: 0,
                honorariosNetosEnCurso: 0,
                honorariosBrutosEnCursoTotal: 0, // Reset del nuevo campo
              },
              lastCalculated: Date.now(),
            });
            return;
          }

          // Filter operations by status for current year
          const operacionesCerradas = operationsCurrentYear.filter(
            (op) => op.estado === OperationStatus.CERRADA
          );

          const operacionesEnCurso = operationsCurrentYear.filter(
            (op) => op.estado === OperationStatus.EN_CURSO
          );

          // Filter operations in progress for previous year
          const operacionesEnCursoPrevYear = operationsPreviousYear.filter(
            (op) => op.estado === OperationStatus.EN_CURSO
          );

          // Calculate honorarios brutos for closed operations
          // Cuando captacion_no_es_mia es true, se usa el neto en lugar del bruto
          const honorariosBrutos = calculateTotalHonorariosBroker(
            operacionesCerradas,
            undefined,
            userData,
            userRole
          );

          // Calculate honorarios brutos for operations in progress of current year
          const honorariosBrutosEnCurso = calculateTotalHonorariosBroker(
            operacionesEnCurso,
            undefined,
            userData,
            userRole
          );

          // Calculate honorarios brutos for operations in progress of previous year
          const honorariosBrutosEnCursoPrevYear =
            calculateTotalHonorariosBroker(
              operacionesEnCursoPrevYear,
              undefined,
              userData,
              userRole
            );

          // Calculate total honorarios brutos en curso (current + previous year)
          const honorariosBrutosEnCursoTotal =
            honorariosBrutosEnCurso + honorariosBrutosEnCursoPrevYear;

          // Calculate honorarios netos for each closed operation and sum them
          const honorariosNetos = operacionesCerradas.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          // Calculate honorarios netos for each operation in progress and sum them
          const honorariosNetosEnCurso = operacionesEnCurso.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          set({
            results: {
              honorariosBrutos,
              honorariosNetos,
              honorariosBrutosEnCurso,
              honorariosNetosEnCurso,
              honorariosBrutosEnCursoTotal,
            },
            lastCalculated: Date.now(),
          });
        } catch (error) {
          console.error("Error al calcular resultados:", error);
          set({ error: (error as Error).message });
        }
      },

      calculateResultsByFilters: (yearFilter, statusFilter) => {
        const { operations, userData, userRole } = get();

        if (operations.length === 0 || !userData || !userRole) {
          return { honorariosBrutos: 0, honorariosNetos: 0 };
        }

        try {
          // Convertir el año del filtro a número
          const yearNumber = parseInt(yearFilter);

          // Filtrar operaciones por año
          const filteredByYear = operations.filter((op) => {
            const operationDate = new Date(
              op.fecha_operacion || op.fecha_reserva || ""
            );
            return (
              isNaN(yearNumber) || operationDate.getFullYear() === yearNumber
            );
          });

          let filteredByStatus = filteredByYear;
          if (statusFilter !== "all") {
            filteredByStatus = filteredByYear.filter(
              (op) => op.estado === statusFilter
            );
          } else {
            filteredByStatus = filteredByYear.filter(
              (op) => op.estado !== OperationStatus.CAIDA
            );
          }

          const honorariosBrutos = calculateTotalHonorariosBroker(
            filteredByStatus,
            undefined,
            userData,
            userRole
          );

          const honorariosNetos = filteredByStatus.reduce(
            (total, operation) =>
              total + totalHonorariosTeamLead(operation, userRole, userData),
            0
          );

          return {
            honorariosBrutos,
            honorariosNetos,
          };
        } catch (error) {
          console.error("Error al calcular resultados con filtros:", error);
          return { honorariosBrutos: 0, honorariosNetos: 0 };
        }
      },

      setIsLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),
    }),
    {
      name: "calculations-storage",
      partialize: (state) => ({
        results: state.results,
        lastCalculated: state.lastCalculated,
        currentUserID: state.currentUserID,
      }),
      version: 1,
    }
  )
);
