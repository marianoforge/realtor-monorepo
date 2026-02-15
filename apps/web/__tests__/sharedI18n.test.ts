import {
  getMessages,
  getLocaleFromCurrency,
  getOperationTypeOptions,
  getPropertyTypeOptions,
  getStatusOptions,
  getOperationTypeLabel,
  getPropertyTypeLabel,
  getStatusLabel,
  isRentalOperationType,
  type SupportedLocale,
} from "@gds-si/shared-i18n";

declare const describe: jest.Describe, it: jest.It, expect: jest.Expect;

const SUPPORTED_LOCALES: SupportedLocale[] = [
  "es-AR",
  "es-CL",
  "es-CO",
  "es-UY",
  "es-PY",
];

describe("shared-i18n - getMessages", () => {
  it("devuelve mensajes con estructura completa para cada locale soportado", () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      const t = getMessages(locale);
      expect(t).toBeDefined();
      expect(t.operation).toBeDefined();
      expect(t.property).toBeDefined();
      expect(t.party).toBeDefined();
      expect(t.fees).toBeDefined();
      expect(t.expenses).toBeDefined();
      expect(t.status).toBeDefined();
      expect(t.common).toBeDefined();
      expect(typeof t.operation.rent).toBe("string");
      expect(typeof t.property.department).toBe("string");
      expect(typeof t.party.tenant).toBe("string");
      expect(typeof t.common.parking).toBe("string");
    });
  });

  it("es-AR devuelve términos argentinos (Alquiler, Inquilino, Expensas)", () => {
    const t = getMessages("es-AR");
    expect(t.operation.rent).toBe("Alquiler");
    expect(t.party.tenant).toBe("Inquilino");
    expect(t.expenses.expensas).toBe("Expensas");
    expect(t.common.parking).toBe("Cochera");
  });

  it("es-CO devuelve términos colombianos (Arriendo, Arrendatario, Apartamentos, Parqueadero)", () => {
    const t = getMessages("es-CO");
    expect(t.operation.rent).toBe("Arriendo");
    expect(t.operation.rent_traditional).toBe("Arriendo Tradicional");
    expect(t.party.tenant).toBe("Arrendatario");
    expect(t.property.department).toBe("Apartamentos");
    expect(t.property.single).toBe("Inmueble");
    expect(t.property.plural).toBe("Inmuebles");
    expect(t.expenses.expensas).toBe("Administración");
    expect(t.expenses.deposit).toBe("Depósito");
    expect(t.common.parking).toBe("Parqueadero");
    expect(t.common.broker).toBe("Corredor");
  });

  it("locale no soportado usa fallback es-AR", () => {
    const t = getMessages("es-MX" as SupportedLocale);
    expect(t.operation.rent).toBe("Alquiler");
  });
});

describe("shared-i18n - getLocaleFromCurrency", () => {
  it("COP devuelve es-CO", () => {
    expect(getLocaleFromCurrency("COP")).toBe("es-CO");
    expect(getLocaleFromCurrency("cop")).toBe("es-CO");
  });

  it("cada moneda soportada devuelve su locale", () => {
    expect(getLocaleFromCurrency("ARS")).toBe("es-AR");
    expect(getLocaleFromCurrency("CLP")).toBe("es-CL");
    expect(getLocaleFromCurrency("UYU")).toBe("es-UY");
    expect(getLocaleFromCurrency("PYG")).toBe("es-PY");
  });

  it("null, undefined o string vacío devuelve es-AR por defecto", () => {
    expect(getLocaleFromCurrency(null)).toBe("es-AR");
    expect(getLocaleFromCurrency(undefined)).toBe("es-AR");
    expect(getLocaleFromCurrency("")).toBe("es-AR");
  });

  it("moneda no mapeada devuelve es-AR", () => {
    expect(getLocaleFromCurrency("USD")).toBe("es-AR");
    expect(getLocaleFromCurrency("EUR")).toBe("es-AR");
  });

  it("acepta código con espacios y normaliza a mayúsculas", () => {
    expect(getLocaleFromCurrency("  cop  ")).toBe("es-CO");
  });
});

describe("shared-i18n - options y labels", () => {
  it("getOperationTypeOptions con es-CO devuelve Arriendo Tradicional como label", () => {
    const t = getMessages("es-CO");
    const options = getOperationTypeOptions(t);
    const arriendo = options.find((o) => o.value === "Alquiler Tradicional");
    expect(arriendo).toBeDefined();
    expect(arriendo?.label).toBe("Arriendo Tradicional");
  });

  it("getPropertyTypeOptions con es-CO devuelve Apartamentos para Departamentos", () => {
    const t = getMessages("es-CO");
    const options = getPropertyTypeOptions(t);
    const dept = options.find((o) => o.value === "Departamentos");
    expect(dept).toBeDefined();
    expect(dept?.label).toBe("Apartamentos");
  });

  it("getOperationTypeOptions con es-CO devuelve Parqueadero para Cochera", () => {
    const t = getMessages("es-CO");
    const options = getOperationTypeOptions(t);
    const parking = options.find((o) => o.value === "Cochera");
    expect(parking).toBeDefined();
    expect(parking?.label).toBe("Parqueadero");
  });

  it("getOperationTypeLabel con es-CO traduce valor canónico", () => {
    const t = getMessages("es-CO");
    expect(getOperationTypeLabel(t, "Alquiler Tradicional")).toBe(
      "Arriendo Tradicional"
    );
    expect(getOperationTypeLabel(t, "Alquiler Comercial")).toBe(
      "Arriendo Comercial"
    );
  });

  it("getPropertyTypeLabel con es-CO traduce Departamentos a Apartamentos", () => {
    const t = getMessages("es-CO");
    expect(getPropertyTypeLabel(t, "Departamentos")).toBe("Apartamentos");
    expect(getPropertyTypeLabel(t, "Chacras")).toBe("Finca");
  });

  it("getStatusOptions devuelve mismo número de opciones para cualquier locale", () => {
    const t = getMessages("es-CO");
    const options = getStatusOptions(t);
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).toEqual([
      "En Curso",
      "Cerrada",
      "Caída",
    ]);
  });

  it("getStatusLabel con valor null o undefined devuelve string vacío", () => {
    const t = getMessages("es-AR");
    expect(getStatusLabel(t, null)).toBe("");
    expect(getStatusLabel(t, undefined)).toBe("");
  });
});

describe("shared-i18n - isRentalOperationType", () => {
  it("devuelve true para Alquiler Tradicional, Temporal y Comercial", () => {
    expect(isRentalOperationType("Alquiler Tradicional")).toBe(true);
    expect(isRentalOperationType("Alquiler Temporal")).toBe(true);
    expect(isRentalOperationType("Alquiler Comercial")).toBe(true);
  });

  it("devuelve false para Venta, Compra y null/undefined", () => {
    expect(isRentalOperationType("Venta")).toBe(false);
    expect(isRentalOperationType("Compra")).toBe(false);
    expect(isRentalOperationType(null)).toBe(false);
    expect(isRentalOperationType(undefined)).toBe(false);
  });
});
