// @ts-nocheck - Tipos de node-mocks-http incompatibles con NextApiRequest/Response
import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/operations";

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
  },
}));

import { adminAuth, db } from "@/lib/firebaseAdmin";

describe("/api/operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("debe rechazar peticiones sin token de autorización", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("UNAUTHORIZED");
    });

    it("debe rechazar peticiones con token inválido", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer invalid-token",
        },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it("debe rechazar peticiones con formato de autorización inválido", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "InvalidFormat token",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/operations", () => {
    it("debe devolver operaciones del usuario autenticado", async () => {
      const mockOperations = [
        {
          id: "op1",
          teamId: "user123",
          tipo_operacion: "venta",
          precio: 100000,
          fecha_operacion: "2024-01-01",
        },
        {
          id: "op2",
          teamId: "user123",
          tipo_operacion: "alquiler",
          precio: 50000,
          fecha_operacion: "2024-01-02",
        },
      ];

      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockQuerySnapshot = {
        docs: mockOperations.map((op) => ({
          id: op.id,
          data: () => {
            const { id, ...dataWithoutId } = op;
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
      expect(response.data).toEqual(mockOperations);
      expect(mockCollection.where).toHaveBeenCalledWith(
        "teamId",
        "==",
        "user123"
      );
      expect(mockQuery.orderBy).toHaveBeenCalledWith("fecha_operacion", "asc");
    });

    it("debe manejar errores de base de datos en GET", async () => {
      const { req, res } = createTypedMocks({
        method: "GET",
        headers: {
          authorization: "Bearer valid-token",
        },
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

  describe("POST /api/operations", () => {
    it("debe crear una nueva operación exitosamente", async () => {
      const newOperation = {
        teamId: "user123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Departamento",
        fecha_operacion: "2024-01-15",
        fecha_reserva: "2024-01-10",
        direccion_reserva: "Calle 123",
        localidad_reserva: "CABA",
        provincia_reserva: "Buenos Aires",
        pais: "Argentina",
        valor_reserva: 150000,
        porcentaje_honorarios_asesor: 3,
        porcentaje_honorarios_broker: 5,
        porcentaje_punta_compradora: 3,
        porcentaje_punta_vendedora: 3,
        punta_compradora: true,
        punta_vendedora: true,
        exclusiva: true,
        no_exclusiva: false,
        honorarios_broker: 7500,
        honorarios_asesor: 4500,
        realizador_venta: "Juan Pérez",
        estado: "En Curso",
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: newOperation,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockDocRef = { id: "new-operation-id" };
      const mockCollection = {
        add: jest.fn().mockResolvedValue(mockDocRef),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.data.id).toBe("new-operation-id");
      expect(response.message).toContain("creada");

      expect(mockCollection.add).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: "user123",
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    });

    it("debe rechazar operaciones sin teamId", async () => {
      const invalidOperation = {
        tipo_operacion: "Venta",
        // teamId y otros campos faltantes
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: invalidOperation,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "teamId" })
      );
    });

    it("debe manejar errores de base de datos en POST", async () => {
      const newOperation = {
        teamId: "user123",
        tipo_operacion: "Venta",
        tipo_inmueble: "Departamento",
        fecha_operacion: "2024-01-15",
        fecha_reserva: "2024-01-10",
        direccion_reserva: "Calle 123",
        localidad_reserva: "CABA",
        provincia_reserva: "Buenos Aires",
        pais: "Argentina",
        valor_reserva: 150000,
        porcentaje_honorarios_asesor: 3,
        porcentaje_honorarios_broker: 5,
        porcentaje_punta_compradora: 3,
        porcentaje_punta_vendedora: 3,
        punta_compradora: true,
        punta_vendedora: true,
        exclusiva: true,
        no_exclusiva: false,
        honorarios_broker: 7500,
        honorarios_asesor: 4500,
        realizador_venta: "Juan Pérez",
        estado: "En Curso",
      };

      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
        },
        body: newOperation,
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const mockCollection = {
        add: jest.fn().mockRejectedValue(new Error("Database error")),
      };

      (db.collection as jest.Mock).mockReturnValue(mockCollection);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("Methods Not Allowed", () => {
    it("debe rechazar métodos HTTP no soportados", async () => {
      const { req, res } = createTypedMocks({
        method: "DELETE",
        headers: {
          authorization: "Bearer valid-token",
        },
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
