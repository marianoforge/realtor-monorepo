// @ts-nocheck - Tipos de node-mocks-http incompatibles con NextApiRequest/Response
import { createMocks } from "node-mocks-http";

// Mock de Firebase Admin
jest.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  db: {
    collection: jest.fn(),
  },
}));

// Mock de Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      retrieve: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  }));
});

// Mock de MailerSend
jest.mock("mailersend", () => ({
  MailerSend: jest.fn().mockImplementation(() => ({
    email: { send: jest.fn() },
  })),
  EmailParams: jest.fn().mockImplementation(() => ({
    setFrom: jest.fn().mockReturnThis(),
    setTo: jest.fn().mockReturnThis(),
    setSubject: jest.fn().mockReturnThis(),
    setText: jest.fn().mockReturnThis(),
  })),
  Sender: jest.fn(),
  Recipient: jest.fn(),
}));

import { adminAuth, db } from "@/lib/firebaseAdmin";

// Helper para crear mocks con propiedad 'env' requerida por NextApiRequest
const createTypedMocks = (options: Parameters<typeof createMocks>[0]) => {
  const { req, res } = createMocks(options);
  req.env = {};
  return { req, res };
};

describe("/api/stripe endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("subscription_status", () => {
    it("debe rechazar peticiones sin subscription_id", async () => {
      const handler = (await import("@/pages/api/stripe/subscription_status"))
        .default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe rechazar subscription_id que no empieza con sub_", async () => {
      const handler = (await import("@/pages/api/stripe/subscription_status"))
        .default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: { subscription_id: "invalid_id" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors[0].message).toContain("sub_");
    });
  });

  describe("customer_info", () => {
    it("debe rechazar peticiones sin customer_id", async () => {
      const handler = (await import("@/pages/api/stripe/customer_info"))
        .default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe rechazar customer_id que no empieza con cus_", async () => {
      const handler = (await import("@/pages/api/stripe/customer_info"))
        .default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: { customer_id: "invalid_customer" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors[0].message).toContain("cus_");
    });
  });

  describe("cancel_subscription", () => {
    it("debe rechazar peticiones sin autorización", async () => {
      const handler = (await import("@/pages/api/stripe/cancel_subscription"))
        .default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: {},
        body: { subscription_id: "sub_123", user_id: "user123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("debe rechazar peticiones sin subscription_id", async () => {
      const handler = (await import("@/pages/api/stripe/cancel_subscription"))
        .default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: { user_id: "user123" },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe rechazar subscription_id inválido", async () => {
      const handler = (await import("@/pages/api/stripe/cancel_subscription"))
        .default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: { subscription_id: "invalid_id", user_id: "user123" },
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors[0].message).toContain("sub_");
    });
  });

  describe("create-post-trial-session", () => {
    it("debe rechazar peticiones sin userId", async () => {
      const handler = (
        await import("@/pages/api/stripe/create-post-trial-session")
      ).default;
      const { req, res } = createTypedMocks({
        method: "POST",
        headers: { authorization: "Bearer valid-token" },
        body: {},
      });

      (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
        uid: "user123",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors).toContainEqual(
        expect.objectContaining({ field: "userId" })
      );
    });
  });
});

describe("/api/checkout endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("[session_id]", () => {
    it("debe rechazar peticiones sin session_id", async () => {
      const handler = (await import("@/pages/api/checkout/[session_id]"))
        .default;
      const { req, res } = createTypedMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("checkout_session", () => {
    it("debe rechazar peticiones sin email", async () => {
      // Mock de Firebase client-side
      jest.mock("@/lib/firebase", () => ({
        db: {},
      }));
      jest.mock("firebase/firestore", () => ({
        doc: jest.fn(),
        getDoc: jest.fn(),
      }));

      const handler = (await import("@/pages/api/checkout/checkout_session"))
        .default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
    });

    it("debe rechazar email inválido", async () => {
      const handler = (await import("@/pages/api/checkout/checkout_session"))
        .default;
      const { req, res } = createTypedMocks({
        method: "POST",
        body: { email: "invalid-email" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.code).toBe("VALIDATION_ERROR");
      expect(response.errors[0].field).toBe("email");
    });
  });
});
