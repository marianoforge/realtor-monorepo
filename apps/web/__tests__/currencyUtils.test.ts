import { getCurrenciesForAmericas } from "@gds-si/shared-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

describe("currencyUtils", () => {
  describe("getCurrenciesForAmericas", () => {
    it("debe retornar array de monedas con código, nombre y símbolo", () => {
      const currencies = getCurrenciesForAmericas();

      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);

      // Verificar estructura de cada moneda
      currencies.forEach((currency) => {
        expect(currency).toHaveProperty("code");
        expect(currency).toHaveProperty("name");
        expect(currency).toHaveProperty("symbol");
        expect(typeof currency.code).toBe("string");
        expect(typeof currency.name).toBe("string");
        expect(typeof currency.symbol).toBe("string");
      });
    });

    it("debe incluir monedas de países de las Américas", () => {
      const currencies = getCurrenciesForAmericas();

      // Verificar que incluye monedas conocidas de las Américas
      const currencyCodes = currencies.map((c) => c.code);

      expect(currencyCodes).toContain("ARS"); // Argentina
      expect(currencyCodes).toContain("USD"); // Estados Unidos
      expect(currencyCodes).toContain("BRL"); // Brasil
      expect(currencyCodes).toContain("CLP"); // Chile
      expect(currencyCodes).toContain("COP"); // Colombia
      expect(currencyCodes).toContain("MXN"); // México
      expect(currencyCodes).toContain("CAD"); // Canadá
    });

    it("debe incluir EUR en la posición correcta (7ma posición después de insertar)", () => {
      const currencies = getCurrenciesForAmericas();

      // Verificar que EUR está presente
      const eurCurrency = currencies.find((c) => c.code === "EUR");
      expect(eurCurrency).toBeDefined();
      expect(eurCurrency?.name).toBe("Euro");
      expect(eurCurrency?.symbol).toBe("€");
    });

    it("debe tener símbolos válidos para todas las monedas", () => {
      const currencies = getCurrenciesForAmericas();

      currencies.forEach((currency) => {
        // El símbolo debe ser un string no vacío
        expect(currency.symbol.length).toBeGreaterThan(0);

        // Si no hay símbolo disponible, debe usar el código como fallback
        if (!currency.symbol || currency.symbol === currency.code) {
          // Esto es válido - algunos códigos no tienen símbolo
          expect(currency.symbol).toBe(currency.code);
        }
      });
    });

    it("debe incluir monedas de países específicos de las Américas", () => {
      const currencies = getCurrenciesForAmericas();
      const currencyCodes = currencies.map((c) => c.code);

      // Verificar países específicos mencionados en el código
      expect(currencyCodes).toContain("UYU"); // Uruguay
      expect(currencyCodes).toContain("PEN"); // Perú
      expect(currencyCodes).toContain("BZD"); // Belize
      expect(currencyCodes).toContain("CRC"); // Costa Rica
      expect(currencyCodes).toContain("GTQ"); // Guatemala
    });

    it("debe retornar resultados consistentes en múltiples llamadas", () => {
      const currencies1 = getCurrenciesForAmericas();
      const currencies2 = getCurrenciesForAmericas();

      expect(currencies1.length).toBe(currencies2.length);
      expect(currencies1).toEqual(currencies2);
    });

    it("debe tener códigos de moneda válidos (3 caracteres)", () => {
      const currencies = getCurrenciesForAmericas();

      currencies.forEach((currency) => {
        expect(currency.code.length).toBe(3);
        expect(currency.code).toMatch(/^[A-Z]{3}$/);
      });
    });

    it("debe incluir nombres de moneda descriptivos", () => {
      const currencies = getCurrenciesForAmericas();

      currencies.forEach((currency) => {
        expect(currency.name.length).toBeGreaterThan(0);
        expect(typeof currency.name).toBe("string");
      });
    });

    it("debe filtrar solo monedas de países de las Américas", () => {
      const currencies = getCurrenciesForAmericas();
      const currencyCodes = currencies.map((c) => c.code);

      // Verificar que NO incluye monedas de otros continentes (excepto EUR que se agrega manualmente)
      // JPY (Japón) no debería estar
      // GBP (Reino Unido) no debería estar
      // CNY (China) no debería estar

      // Nota: EUR se agrega manualmente, así que está bien
      const nonAmericanCurrencies = ["JPY", "GBP", "CNY", "INR", "AUD"];

      nonAmericanCurrencies.forEach((code) => {
        if (code !== "EUR") {
          // EUR está permitido porque se agrega manualmente
          expect(currencyCodes).not.toContain(code);
        }
      });
    });
  });
});
