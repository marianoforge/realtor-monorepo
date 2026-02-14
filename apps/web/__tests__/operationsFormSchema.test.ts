import { schema } from "@gds-si/shared-schemas/operationsFormSchema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

describe("Operations Form Schema", () => {
  // Datos v?lidos para operaci?n de Venta (punta_vendedora es obligatoria)
  const validOperationData = {
    fecha_reserva: "2024-01-15",
    fecha_captacion: "2024-01-10",
    fecha_operacion: "2024-02-15",
    direccion_reserva: "Av. Corrientes 1234",
    numero_casa: "1234",
    localidad_reserva: "CABA",
    provincia_reserva: "Buenos Aires",
    tipo_operacion: "Venta",
    valor_reserva: 150000,
    porcentaje_punta_compradora: 50,
    porcentaje_punta_vendedora: 50,
    punta_compradora: true,
    punta_vendedora: true, // Obligatorio para Venta
    exclusiva: true,
    no_exclusiva: false,
    estado: "En Curso",
    tipo_inmueble: "Departamento",
    gastos_operacion: 5000,
  };

  // Datos v?lidos para operaci?n de Compra (punta_vendedora NO es obligatoria)
  const validCompraData = {
    ...validOperationData,
    tipo_operacion: "Compra",
    punta_vendedora: false,
    punta_compradora: true,
  };

  describe("Campos Obligatorios", () => {
    it("debe validar correctamente datos v?lidos completos", async () => {
      await expect(schema.validate(validOperationData)).resolves.toEqual(
        validOperationData
      );
    });

    it("debe requerir fecha_reserva", async () => {
      const invalidData = { ...validOperationData, fecha_reserva: "" };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La fecha de reserva es requerida"
      );
    });

    it("debe requerir direccion_reserva", async () => {
      const invalidData = { ...validOperationData, direccion_reserva: "" };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La dirección de reserva es requerida"
      );
    });

    it("debe requerir tipo_operacion", async () => {
      const invalidData = { ...validOperationData, tipo_operacion: "" };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El tipo de operación es requerido"
      );
    });

    it("debe requerir valor_reserva", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { valor_reserva, ...invalidData } = validOperationData;
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El valor de reserva es requerido"
      );
    });

    it("debe requerir estado", async () => {
      const invalidData = { ...validOperationData, estado: "" };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El estado es requerido"
      );
    });
  });

  describe("Validaci?n de Valor de Reserva", () => {
    it("debe aceptar valores positivos", async () => {
      const validData = { ...validOperationData, valor_reserva: 100000 };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe rechazar valores negativos", async () => {
      const invalidData = { ...validOperationData, valor_reserva: -1000 };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El valor de reserva debe ser positivo"
      );
    });

    it("debe rechazar valores de texto", async () => {
      const invalidData = {
        ...validOperationData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        valor_reserva: "abc" as any,
      };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El valor de reserva debe ser un número"
      );
    });

    it("debe rechazar valor cero", async () => {
      const invalidData = { ...validOperationData, valor_reserva: 0 };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "El valor de reserva debe ser positivo"
      );
    });
  });

  describe("Validación de Porcentajes", () => {
    it("debe validar porcentaje_punta_compradora correcto", async () => {
      const validData = {
        ...validOperationData,
        porcentaje_punta_compradora: 60,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe validar porcentaje_punta_vendedora correcto", async () => {
      const validData = {
        ...validOperationData,
        porcentaje_punta_vendedora: 40,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe rechazar porcentajes negativos en punta compradora", async () => {
      const invalidData = {
        ...validOperationData,
        porcentaje_punta_compradora: -10,
      };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "No puede ser negativo"
      );
    });

    it("debe rechazar porcentajes negativos en punta vendedora", async () => {
      const invalidData = {
        ...validOperationData,
        porcentaje_punta_vendedora: -5,
      };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "No puede ser negativo"
      );
    });

    it("debe manejar porcentajes opcionales como nulos", async () => {
      const validData = {
        ...validOperationData,
        porcentaje_honorarios_asesor: null,
        porcentaje_compartido: null,
        porcentaje_referido: null,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe("Campos Booleanos", () => {
    it("debe validar combinaciones v?lidas de exclusividad", async () => {
      const exclusiva = {
        ...validOperationData,
        exclusiva: true,
        no_exclusiva: false,
      };
      const noExclusiva = {
        ...validOperationData,
        exclusiva: false,
        no_exclusiva: true,
      };

      await expect(schema.validate(exclusiva)).resolves.toEqual(exclusiva);
      await expect(schema.validate(noExclusiva)).resolves.toEqual(noExclusiva);
    });

    it("debe aceptar operación sin exclusividad seleccionada", async () => {
      const sinExclusividad = {
        ...validOperationData,
        exclusiva: false,
        no_exclusiva: false,
      };

      await expect(schema.validate(sinExclusividad)).resolves.toEqual(
        sinExclusividad
      );
    });

    it("debe validar combinaciones de puntas", async () => {
      // Para Compra: punta_vendedora no es obligatoria
      const soloCompradora = {
        ...validCompraData,
        punta_compradora: true,
        punta_vendedora: false,
      };
      // Para Venta: punta_vendedora es obligatoria
      const soloVendedora = {
        ...validOperationData,
        punta_compradora: false,
        punta_vendedora: true,
      };
      const ambas = {
        ...validOperationData,
        punta_compradora: true,
        punta_vendedora: true,
      };

      await expect(schema.validate(soloCompradora)).resolves.toEqual(
        soloCompradora
      );
      await expect(schema.validate(soloVendedora)).resolves.toEqual(
        soloVendedora
      );
      await expect(schema.validate(ambas)).resolves.toEqual(ambas);
    });

    it("debe requerir punta_vendedora para operaciones de Venta", async () => {
      const ventaSinPuntaVendedora = {
        ...validOperationData,
        tipo_operacion: "Venta",
        punta_vendedora: false,
      };

      await expect(schema.validate(ventaSinPuntaVendedora)).rejects.toThrow(
        "La punta vendedora es obligatoria para operaciones de Venta"
      );
    });

    it("debe permitir punta_vendedora false para operaciones de Compra", async () => {
      const compraSinPuntaVendedora = {
        ...validCompraData,
        tipo_operacion: "Compra",
        punta_vendedora: false,
        punta_compradora: true,
      };

      await expect(schema.validate(compraSinPuntaVendedora)).resolves.toEqual(
        compraSinPuntaVendedora
      );
    });
  });

  describe("Campos Opcionales", () => {
    it("debe permitir campos de fecha opcionales como nulos", async () => {
      const validData = {
        ...validOperationData,
        fecha_operacion: null,
        fecha_captacion: null,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe permitir campos de direcci?n opcionales", async () => {
      const validData = {
        ...validOperationData,
        numero_casa: null,
        localidad_reserva: null,
        provincia_reserva: null,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe permitir campos de sobre opcionales", async () => {
      const validData = {
        ...validOperationData,
        numero_sobre_reserva: null,
        numero_sobre_refuerzo: null,
        monto_sobre_reserva: null,
        monto_sobre_refuerzo: null,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe permitir campos de equipo opcionales", async () => {
      const validData = {
        ...validOperationData,
        realizador_venta: null,
        realizador_venta_adicional: null,
        porcentaje_honorarios_asesor: null,
        porcentaje_honorarios_asesor_adicional: null,
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe("Transformaciones de Datos", () => {
    it("debe transformar strings vacíos en null para fecha_reserva", async () => {
      const dataWithEmptyString = { ...validOperationData, fecha_reserva: "" };
      await expect(schema.validate(dataWithEmptyString)).rejects.toThrow();
    });

    it("debe transformar strings vacíos en 0 para montos", async () => {
      const dataWithEmptyMonto = {
        ...validOperationData,
        monto_sobre_reserva: "",
        monto_sobre_refuerzo: "",
        gastos_operacion: "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = await schema.validate(dataWithEmptyMonto);
      expect(result.monto_sobre_reserva).toBe(0);
      expect(result.monto_sobre_refuerzo).toBe(0);
      expect(result.gastos_operacion).toBe(0);
    });

    it("debe transformar strings vacíos en null para realizador_venta", async () => {
      const dataWithEmptyRealizador = {
        ...validOperationData,
        realizador_venta: "",
      };

      const result = await schema.validate(dataWithEmptyRealizador);
      expect(result.realizador_venta).toBeNull();
    });
  });

  describe("Tipos de Operación Específicos", () => {
    it("debe validar operación de Venta con tipo de inmueble", async () => {
      const ventaData = {
        ...validOperationData,
        tipo_operacion: "Venta",
        tipo_inmueble: "Casa",
      };
      await expect(schema.validate(ventaData)).resolves.toEqual(ventaData);
    });

    it("debe validar operación de Alquiler", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Tradicional",
        tipo_inmueble: null,
        punta_vendedora: false, // No obligatoria para Alquiler
        punta_compradora: true,
      };
      await expect(schema.validate(alquilerData)).resolves.toEqual(
        alquilerData
      );
    });
  });

  describe("Validación de Gastos", () => {
    it("debe aceptar gastos de operación válidos", async () => {
      const validData = { ...validOperationData, gastos_operacion: 10000 };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("debe rechazar gastos negativos", async () => {
      const invalidData = { ...validOperationData, gastos_operacion: -1000 };
      await expect(schema.validate(invalidData)).rejects.toThrow(
        "No puede ser negativo"
      );
    });

    it("debe aceptar gastos como cero", async () => {
      const validData = { ...validOperationData, gastos_operacion: 0 };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });
  });

  describe("Fecha de Vencimiento de Alquiler", () => {
    it("debe aceptar fecha_vencimiento_alquiler para Alquiler Tradicional", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Tradicional",
        tipo_inmueble: null,
        punta_vendedora: false,
        punta_compradora: true,
        fecha_vencimiento_alquiler: "2026-01-15",
      };
      const result = await schema.validate(alquilerData);
      expect(result.fecha_vencimiento_alquiler).toBe("2026-01-15");
    });

    it("debe aceptar fecha_vencimiento_alquiler para Alquiler Temporal", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Temporal",
        tipo_inmueble: null,
        punta_vendedora: false,
        punta_compradora: true,
        fecha_vencimiento_alquiler: "2026-06-30",
      };
      const result = await schema.validate(alquilerData);
      expect(result.fecha_vencimiento_alquiler).toBe("2026-06-30");
    });

    it("debe aceptar fecha_vencimiento_alquiler para Alquiler Comercial", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Comercial",
        tipo_inmueble: null,
        punta_vendedora: false,
        punta_compradora: true,
        fecha_vencimiento_alquiler: "2027-12-31",
      };
      const result = await schema.validate(alquilerData);
      expect(result.fecha_vencimiento_alquiler).toBe("2027-12-31");
    });

    it("debe aceptar fecha_vencimiento_alquiler null para alquileres", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Tradicional",
        tipo_inmueble: null,
        punta_vendedora: false,
        punta_compradora: true,
        fecha_vencimiento_alquiler: null,
      };
      const result = await schema.validate(alquilerData);
      expect(result.fecha_vencimiento_alquiler).toBeNull();
    });

    it("debe transformar string vacío a null para fecha_vencimiento_alquiler", async () => {
      const alquilerData = {
        ...validOperationData,
        tipo_operacion: "Alquiler Tradicional",
        tipo_inmueble: null,
        punta_vendedora: false,
        punta_compradora: true,
        fecha_vencimiento_alquiler: "",
      };
      const result = await schema.validate(alquilerData);
      expect(result.fecha_vencimiento_alquiler).toBeNull();
    });

    it("debe transformar fecha_vencimiento_alquiler a null para operaciones de Venta", async () => {
      const ventaData = {
        ...validOperationData,
        tipo_operacion: "Venta",
        fecha_vencimiento_alquiler: "2026-01-15",
      };
      const result = await schema.validate(ventaData);
      expect(result.fecha_vencimiento_alquiler).toBeNull();
    });

    it("debe transformar fecha_vencimiento_alquiler a null para operaciones de Compra", async () => {
      const compraData = {
        ...validOperationData,
        tipo_operacion: "Compra",
        punta_vendedora: false,
        fecha_vencimiento_alquiler: "2026-01-15",
      };
      const result = await schema.validate(compraData);
      expect(result.fecha_vencimiento_alquiler).toBeNull();
    });
  });
});
