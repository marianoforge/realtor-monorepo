// @ts-nocheck - Tipos de node-mocks-http incompatibles con NextApiRequest/Response
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/expenses";

// Helper para crear mocks con propiedad 'env' requerida por NextApiRequest
const createTypedMocks = (options: Parameters<typeof createMocks>[0]) => {
  const { req, res } = createMocks(options);
  req.env = {};
  return { req, res };
};

// Mock de Firebase Admin
jest.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  db: {
    collection: jest.fn(),
    batch: jest.fn(),
  },
}));

import { adminAuth, db } from "@/lib/firebaseAdmin";

describe("/api/expenses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("debe rechazar peticiones sin token de autorización", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {},
        query: { user_uid: "user123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("UNAUTHORIZED");
    });

    it("debe rechazar peticiones sin user_uid", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
        query: {},
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "user_uid" })
      );
    });
  });

  describe("GET /api/expenses", () => {
    it("debe devolver gastos del usuario autenticado", async () => {
      const mockExpenses = [
        {
          id: "exp1",
          user_uid: "user123",
          amount: 1000,
          expenseType: "marketing",
          date: "2024-01-01",
          description: "Publicidad online",
        },
        {
          id: "exp2",
          user_uid: "user123",
          amount: 500,
          expenseType: "oficina",
          date: "2024-01-02",
          description: "Alquiler oficina",
        },
      ];

      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
        query: { user_uid: "user123" },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockQuerySnapshot = {
        docs: mockExpenses.map((exp) => ({
          id: exp.id,
          data: () => {
            const { id, ...dataWithoutId } = exp;
            return dataWithoutId;
          },
        })),
      };

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockQuerySnapshot),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockExpenses);
      expect(mockCollection.where).toHaveBeenCalledWith(
        "user_uid",
        "==",
        "user123"
      );
      expect(mockQuery.orderBy).toHaveBeenCalledWith("date", "asc");
    });

    it("debe manejar errores de base de datos en GET", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
        query: { user_uid: "user123" },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error("Database error")),
      };

      const mockCollection = {
        where: jest.fn().mockReturnValue(mockQuery),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("POST /api/expenses", () => {
    it("debe crear un gasto simple exitosamente", async () => {
      const newExpense = {
        user_uid: "user123",
        date: "2024-01-15",
        amount: 800,
        expenseType: "marketing",
        description: "Campaña publicitaria",
        dollarRate: 1000,
        isRecurring: false,
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: newExpense,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      // Mock del documento de usuario
      const mockUserDoc = {
        data: () => ({ currency: "ARS" }),
      };

      const mockUserCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc),
        }),
      };

      const mockDocRef = { id: "new-expense-id" };
      const mockExpensesCollection = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };

      (db.collection as jest.Mock)
        .mockReturnValueOnce(mockUserCollection) // Primera llamada para 'users'
        .mockReturnValueOnce(mockExpensesCollection); // Segunda llamada para 'expenses'

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data.id).toBe("new-expense-id");

      expect(mockExpensesCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 800,
          amountInDollars: 0.8, // 800 / 1000
          expenseType: "marketing",
          description: "Campaña publicitaria",
          dollarRate: 1000,
          user_uid: "user123",
          date: "2024-01-15",
          isRecurring: false,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });

    it("debe manejar moneda USD correctamente", async () => {
      const newExpense = {
        user_uid: "user123",
        date: "2024-01-15",
        amount: 100,
        expenseType: "oficina",
        description: "Suministros",
        isRecurring: false,
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: newExpense,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      // Mock del documento de usuario con moneda USD
      const mockUserDoc = {
        data: () => ({ currency: "USD" }),
      };

      const mockUserCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc),
        }),
      };

      const mockDocRef = { id: "new-expense-id" };
      const mockExpensesCollection = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };

      (db.collection as jest.Mock)
        .mockReturnValueOnce(mockUserCollection)
        .mockReturnValueOnce(mockExpensesCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(mockExpensesCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          amountInDollars: 100, // Para USD, amount = amountInDollars
          dollarRate: 1, // Para USD, dollarRate = 1
        })
      );
    });

    it("debe rechazar gastos sin campos obligatorios", async () => {
      const invalidExpense = {
        user_uid: "user123",
        // faltan date, amount, expenseType
        description: "Gasto sin datos",
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: invalidExpense,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockUserDoc = {
        data: () => ({ currency: "ARS" }),
      };

      const mockUserCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc),
        }),
      };

      (db.collection as jest.Mock).mockReturnValue(mockUserCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors.length).toBeGreaterThan(0);
    });

    it("debe rechazar gastos sin dollarRate para monedas no USD", async () => {
      const invalidExpense = {
        user_uid: "user123",
        date: "2024-01-15",
        amount: 800,
        expenseType: "marketing",
        description: "Sin tasa de cambio",
        // falta dollarRate
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: invalidExpense,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockUserDoc = {
        data: () => ({ currency: "ARS" }),
      };

      const mockUserCollection = {
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc),
        }),
      };

      (db.collection as jest.Mock).mockReturnValue(mockUserCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "dollarRate" })
      );
    });
  });

  describe("Methods Not Allowed", () => {
    it("debe rechazar métodos HTTP no soportados", async () => {
      const { req, res } = createTypedMocks({
        method: "DELETE",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: { user_uid: "user123" },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("METHOD_NOT_ALLOWED");
    });
  });
});
