// @ts-nocheck - Tipos de node-mocks-http incompatibles con NextApiRequest/Response
import { createMocks } from "node-mocks-http";

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

// Mock de authMiddleware
jest.mock("@/lib/authMiddleware", () => ({
  verifyToken: jest.fn(),
}));

// Mock de backofficeAuth
jest.mock("@/lib/backofficeAuth", () => ({
  withBackofficeAuth: (handler: any) => handler,
}));

import { adminAuth, db } from "@/lib/firebaseAdmin";
import { verifyToken } from "@/lib/authMiddleware";

// Helper para crear mocks con propiedad 'env' requerida por NextApiRequest
const createTypedMocks = (options: Parameters<typeof createMocks>[0]) => {
  const { req, res } = createMocks(options);
  req.env = {};
  return { req, res };
};

describe("/api/backoffice endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("delete-user", () => {
    it("debe rechazar peticiones sin userId", async () => {
      const handler = (await import("@/pages/api/backoffice/delete-user"))
        .default;
      const { req, res } = createTypedMocks({
        method: "DELETE",
        headers: { authorization: "Bearer valid-token" },
        body: {},
      });

      (verifyToken as jest.Mock).mockResolvedValue({
        uid: "qaab6bRZHpZiRuq6981thD3mYm03",
        email: "mariano@bigbangla.biz",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      // El mensaje puede venir del formatter de Zod
      expect(response.message).toBeDefined();
    });

    it("debe rechazar peticiones sin autorización de backoffice", async () => {
      const handler = (await import("@/pages/api/backoffice/delete-user"))
        .default;
      const { req, res } = createTypedMocks({
        method: "DELETE",
        headers: { authorization: "Bearer valid-token" },
        body: { userId: "user123" },
      });

      (verifyToken as jest.Mock).mockResolvedValue({
        uid: "regular_user",
        email: "regular@example.com",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
    });
  });

  describe("change-user-status", () => {
    it("debe rechazar peticiones sin userId", async () => {
      const handler = (
        await import("@/pages/api/backoffice/change-user-status")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: { newStatus: "active" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "userId" })
      );
    });

    it("debe rechazar peticiones sin newStatus", async () => {
      const handler = (
        await import("@/pages/api/backoffice/change-user-status")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: { userId: "user123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "newStatus" })
      );
    });

    it("debe rechazar newStatus inválido", async () => {
      const handler = (
        await import("@/pages/api/backoffice/change-user-status")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: { userId: "user123", newStatus: "invalid_status" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe aceptar newStatus válido", async () => {
      const handler = (
        await import("@/pages/api/backoffice/change-user-status")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: { userId: "user123", newStatus: "active" },
      });

      // Mock successful DB operation
      const mockUserRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ subscriptionStatus: "trialing" }),
        }),
        update: jest.fn().mockResolvedValue(undefined),
      };

      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue(mockUserRef),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
    });
  });

  describe("trial-crm (PUT)", () => {
    it("debe rechazar PUT sin userId", async () => {
      const handler = (await import("@/pages/api/backoffice/trial-crm"))
        .default;
      const { req, res } = createTypedMocks({
        method: "PUT",
        body: { crmStatus: "Bienvenida" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe rechazar PUT con crmStatus inválido", async () => {
      const handler = (await import("@/pages/api/backoffice/trial-crm"))
        .default;
      const { req, res } = createTypedMocks({
        method: "PUT",
        body: { userId: "user123", crmStatus: "Invalid Status" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe aceptar PUT con datos válidos", async () => {
      const handler = (await import("@/pages/api/backoffice/trial-crm"))
        .default;
      const { req, res } = createTypedMocks({
        method: "PUT",
        body: { userId: "user123", crmStatus: "Seguimiento" },
      });

      // Mock successful DB operation
      (db.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
    });
  });

  describe("debug-user-dashboard", () => {
    it("debe rechazar GET sin userId", async () => {
      const handler = (
        await import("@/pages/api/backoffice/debug-user-dashboard")
      ).default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("clean-users-without-stripe", () => {
    it("debe aceptar mode analyze por defecto", async () => {
      const handler = (
        await import("@/pages/api/backoffice/clean-users-without-stripe")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {},
      });

      (verifyToken as jest.Mock).mockResolvedValue({
        uid: "qaab6bRZHpZiRuq6981thD3mYm03",
        email: "mariano@bigbangla.biz",
      });

      // Mock empty collection
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue({ empty: true }),
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
    });

    it("debe rechazar mode inválido", async () => {
      const handler = (
        await import("@/pages/api/backoffice/clean-users-without-stripe")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: { mode: "invalid_mode" },
      });

      (verifyToken as jest.Mock).mockResolvedValue({
        uid: "qaab6bRZHpZiRuq6981thD3mYm03",
        email: "mariano@bigbangla.biz",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("VALIDATION_ERROR");
    });
  });
});
