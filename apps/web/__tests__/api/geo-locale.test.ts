import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/geo/locale";

declare const describe: jest.Describe, it: jest.It, expect: jest.Expect;

describe("/api/geo/locale", () => {
  describe("GET", () => {
    it("devuelve es-CO cuando el header x-vercel-ip-country es CO", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: { "x-vercel-ip-country": "CO" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.locale).toBe("es-CO");
    });

    it("devuelve es-CO cuando el header cf-ipcountry es CO", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: { "cf-ipcountry": "CO" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).locale).toBe("es-CO");
    });

    it("devuelve es-AR cuando el header es AR", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: { "x-vercel-ip-country": "AR" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).locale).toBe("es-AR");
    });

    it("devuelve es-AR por defecto cuando no hay header de país", async () => {
      const { req, res } = createMocks({ method: "GET" });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).locale).toBe("es-AR");
    });

    it("devuelve es-AR cuando el país no está soportado", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: { "x-vercel-ip-country": "US" },
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData()).locale).toBe("es-AR");
    });
  });

  describe("otros métodos", () => {
    it("devuelve 405 para POST", async () => {
      const { req, res } = createMocks({ method: "POST" });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData()).error).toBe("Method not allowed");
    });
  });
});
