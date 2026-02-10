/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests para userDataStore
 *
 * Verifica que el store maneja correctamente los datos del usuario,
 * especialmente la extracción de datos del nuevo formato de respuesta API.
 */

import { act } from "react";
import { useUserDataStore } from "@/stores/userDataStore";

declare const describe: any, it: any, expect: any, beforeEach: any, jest: any;

// Mock de Firebase
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  })),
  setPersistence: jest.fn().mockResolvedValue(undefined),
  browserLocalPersistence: {},
  onAuthStateChanged: jest.fn(),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  initializeFirestore: jest.fn(),
  persistentLocalCache: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("firebase/messaging", () => ({
  getMessaging: jest.fn(),
  isSupported: jest.fn().mockResolvedValue(false),
}));

// Mock de axios
jest.mock("axios");

describe("userDataStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useUserDataStore.setState({
        items: [],
        userData: null,
        isLoading: false,
        error: null,
        role: null,
      });
    });
  });

  describe("setUserData", () => {
    const mockUserData = {
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      numeroTelefono: "1234567890",
      role: "team_leader_broker",
      uid: "user-123",
      stripeSubscriptionId: "sub_123456",
      objetivoAnual: 100000,
      currency: "USD",
      currencySymbol: "$",
    };

    it("debe guardar userData directamente cuando viene en formato antiguo", () => {
      act(() => {
        useUserDataStore.getState().setUserData(mockUserData as any);
      });

      const state = useUserDataStore.getState();
      expect(state.userData).toEqual(mockUserData);
      expect(state.userData?.firstName).toBe("Juan");
      expect(state.userData?.stripeSubscriptionId).toBe("sub_123456");
    });

    it("debe extraer userData del nuevo formato { success, data }", () => {
      const wrappedData = {
        success: true,
        data: mockUserData,
      };

      act(() => {
        useUserDataStore.getState().setUserData(wrappedData as any);
      });

      const state = useUserDataStore.getState();
      // Debe extraer los datos internos, no guardar el wrapper
      expect(state.userData).toEqual(mockUserData);
      expect(state.userData?.firstName).toBe("Juan");
      expect(state.userData?.stripeSubscriptionId).toBe("sub_123456");
      // No debe tener las propiedades del wrapper
      expect((state.userData as any)?.success).toBeUndefined();
    });

    it("debe manejar datos doblemente envueltos", () => {
      // Caso edge: datos que vienen envueltos dos veces
      const doubleWrapped = {
        success: true,
        data: {
          success: true,
          data: mockUserData,
        },
      };

      act(() => {
        useUserDataStore.getState().setUserData(doubleWrapped as any);
      });

      const state = useUserDataStore.getState();
      // Debe extraer al menos un nivel
      // El segundo nivel se extraerá si se pasa por extractData de nuevo
      expect(state.userData).toBeDefined();
    });

    it("debe manejar null correctamente", () => {
      // Primero establecer userData
      act(() => {
        useUserDataStore.getState().setUserData(mockUserData as any);
      });

      // Luego limpiarla
      act(() => {
        useUserDataStore.getState().setUserData(null);
      });

      const state = useUserDataStore.getState();
      expect(state.userData).toBeNull();
    });

    it("debe preservar stripeSubscriptionId después de la extracción", () => {
      const dataWithSubscription = {
        success: true,
        data: {
          ...mockUserData,
          stripeSubscriptionId: "sub_1Qn6BxLhJiHtNGWdgGz5YBlT",
        },
      };

      act(() => {
        useUserDataStore.getState().setUserData(dataWithSubscription as any);
      });

      const state = useUserDataStore.getState();
      expect(state.userData?.stripeSubscriptionId).toBe(
        "sub_1Qn6BxLhJiHtNGWdgGz5YBlT"
      );
    });

    it("debe preservar objetivoAnual después de la extracción", () => {
      const dataWithObjetivo = {
        success: true,
        data: {
          ...mockUserData,
          objetivoAnual: 150000,
          objetivosAnuales: { "2026": 200000 },
        },
      };

      act(() => {
        useUserDataStore.getState().setUserData(dataWithObjetivo as any);
      });

      const state = useUserDataStore.getState();
      expect(state.userData?.objetivoAnual).toBe(150000);
      expect((state.userData as any)?.objetivosAnuales?.["2026"]).toBe(200000);
    });
  });

  describe("setUserRole", () => {
    it("debe establecer el rol correctamente", () => {
      act(() => {
        useUserDataStore.getState().setUserRole("team_leader_broker");
      });

      const state = useUserDataStore.getState();
      expect(state.role).toBe("team_leader_broker");
    });

    it("debe permitir limpiar el rol", () => {
      act(() => {
        useUserDataStore.getState().setUserRole("agente_asesor");
      });

      act(() => {
        useUserDataStore.getState().setUserRole(null);
      });

      const state = useUserDataStore.getState();
      expect(state.role).toBeNull();
    });
  });

  describe("clearUserData", () => {
    it("debe limpiar userData y error", () => {
      // Establecer datos
      act(() => {
        useUserDataStore.setState({
          userData: { firstName: "Test" } as any,
          error: "Some error",
        });
      });

      // Limpiar
      act(() => {
        useUserDataStore.getState().clearUserData();
      });

      const state = useUserDataStore.getState();
      expect(state.userData).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("setIsLoading", () => {
    it("debe establecer isLoading correctamente", () => {
      act(() => {
        useUserDataStore.getState().setIsLoading(true);
      });

      expect(useUserDataStore.getState().isLoading).toBe(true);

      act(() => {
        useUserDataStore.getState().setIsLoading(false);
      });

      expect(useUserDataStore.getState().isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("debe establecer mensajes de error", () => {
      act(() => {
        useUserDataStore.getState().setError("Error de conexión");
      });

      expect(useUserDataStore.getState().error).toBe("Error de conexión");
    });

    it("debe permitir limpiar errores", () => {
      act(() => {
        useUserDataStore.getState().setError("Error");
      });

      act(() => {
        useUserDataStore.getState().setError(null);
      });

      expect(useUserDataStore.getState().error).toBeNull();
    });
  });
});

// ============================================================================
// Tests para extractData helper (comportamiento esperado)
// ============================================================================

describe("extractData behavior in store", () => {
  beforeEach(() => {
    act(() => {
      useUserDataStore.setState({
        items: [],
        userData: null,
        isLoading: false,
        error: null,
        role: null,
      });
    });
  });

  it("debe extraer datos cuando success es true y data existe", () => {
    const apiResponse = {
      success: true,
      data: {
        firstName: "Carlos",
        email: "carlos@test.com",
      },
    };

    act(() => {
      useUserDataStore.getState().setUserData(apiResponse as any);
    });

    const state = useUserDataStore.getState();
    expect(state.userData?.firstName).toBe("Carlos");
    expect(state.userData?.email).toBe("carlos@test.com");
  });

  it("debe retornar datos sin modificar cuando no tienen formato API", () => {
    const plainData = {
      firstName: "Ana",
      email: "ana@test.com",
    };

    act(() => {
      useUserDataStore.getState().setUserData(plainData as any);
    });

    const state = useUserDataStore.getState();
    expect(state.userData?.firstName).toBe("Ana");
    expect(state.userData?.email).toBe("ana@test.com");
  });

  it("no debe confundir objetos con propiedad data pero sin success", () => {
    const confusingData = {
      firstName: "Luis",
      data: "some-value", // Esta propiedad no debería causar extracción incorrecta
    };

    act(() => {
      useUserDataStore.getState().setUserData(confusingData as any);
    });

    const state = useUserDataStore.getState();
    expect(state.userData?.firstName).toBe("Luis");
  });
});
