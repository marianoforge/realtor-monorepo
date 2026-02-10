import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/auth/reset-password";

// Mock de Firebase
jest.mock("@/lib/firebase", () => ({
  auth: {
    sendPasswordResetEmail: jest.fn(),
  },
}));

// Mock de Firebase Admin
jest.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: {
    getUserByEmail: jest.fn(),
  },
}));

// Mock de sendPasswordResetEmail
jest.mock("firebase/auth", () => ({
  sendPasswordResetEmail: jest.fn(),
}));

import { sendPasswordResetEmail } from "firebase/auth";
import { adminAuth } from "@/lib/firebaseAdmin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any, beforeEach: any;

describe("/api/auth/reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Método HTTP", () => {
    it("debe rechazar métodos que no sean POST", async () => {
      const { req, res } = createMocks({
        method: "GET",
        body: { email: "test@example.com" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(405);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.code).toBe("METHOD_NOT_ALLOWED");
    });

    it("debe aceptar método POST", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "test@example.com" },
      });

      (adminAuth.getUserByEmail as jest.Mock).mockResolvedValue({
        uid: "user123",
        email: "test@example.com",
      });
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe("Validación de entrada", () => {
    it("debe rechazar peticiones sin email", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {},
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });

    it("debe rechazar peticiones con email vacío", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });

    it("debe rechazar peticiones con email que no es string", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: 123 },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });
  });

  describe("Verificación de usuario existente", () => {
    it("debe rechazar email no registrado", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "nonexistent@example.com" },
      });

      const error = { code: "auth/user-not-found" };
      (adminAuth.getUserByEmail as jest.Mock).mockRejectedValue(error);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.message).toContain("no está registrado");
      expect(adminAuth.getUserByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
    });

    it("debe continuar con flujo normal si hay error diferente a user-not-found", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "test@example.com" },
      });

      const error = { code: "auth/network-error" };
      (adminAuth.getUserByEmail as jest.Mock).mockRejectedValue(error);
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  describe("Envío de email de reset", () => {
    it("debe enviar email de reset exitosamente para usuario existente", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "existing@example.com" },
      });

      (adminAuth.getUserByEmail as jest.Mock).mockResolvedValue({
        uid: "user123",
        email: "existing@example.com",
      });
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.message).toContain("existing@example.com");
      expect(adminAuth.getUserByEmail).toHaveBeenCalledWith(
        "existing@example.com"
      );
      expect(sendPasswordResetEmail).toHaveBeenCalled();
    });

    it("debe manejar error de usuario no encontrado durante envío", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "test@example.com" },
      });

      (adminAuth.getUserByEmail as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const error = { code: "auth/user-not-found" };
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.message).toContain("no está registrado");
    });

    it("debe manejar error de email inválido", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "invalid-email" },
      });

      await handler(req as any, res as any);

      // Zod valida el email antes de llegar a Firebase
      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
      );
    });

    it("debe manejar errores genéricos", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { email: "test@example.com" },
      });

      (adminAuth.getUserByEmail as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      const error = { code: "auth/network-error", message: "Network error" };
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(error);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(false);
      expect(response.message).toContain("Error al enviar");
    });
  });

  describe("Casos de uso completos", () => {
    it("debe manejar todo el flujo exitoso completo", async () => {
      const testEmail = "complete@example.com";
      const { req, res } = createMocks({
        method: "POST",
        body: { email: testEmail },
      });

      // Mock usuario existente
      (adminAuth.getUserByEmail as jest.Mock).mockResolvedValue({
        uid: "user123",
        email: testEmail,
      });

      // Mock envío exitoso
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.success).toBe(true);
      expect(response.message).toContain(testEmail);

      // Verificar que se llamaron las funciones correctas
      expect(adminAuth.getUserByEmail).toHaveBeenCalledWith(testEmail);
      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    });
  });
});
