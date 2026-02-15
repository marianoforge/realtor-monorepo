import * as yup from "yup";

export const schema = yup.object().shape({
  fecha_operacion: yup.string().nullable(),
  fecha_reserva: yup
    .string()
    .required("La fecha de reserva es requerida")
    .transform((value) => (value === "" ? null : value)),
  fecha_captacion: yup.string().nullable(),
  direccion_reserva: yup
    .string()
    .required("La dirección de reserva es requerida"),
  numero_casa: yup.string().nullable(),
  localidad_reserva: yup.string().nullable(),
  provincia_reserva: yup.string().nullable(),
  tipo_operacion: yup.string().required("El tipo de operación es requerido"),
  valor_reserva: yup
    .number()
    .typeError("El valor de reserva debe ser un número")
    .positive("El valor de reserva debe ser positivo")
    .required("El valor de reserva es requerido"),

  porcentaje_honorarios_broker: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),

  porcentaje_punta_compradora: yup
    .number()
    .typeError("El porcentaje de punta compradora es requerido")
    .required("El porcentaje de punta compradora es requerido")
    .min(0, "No puede ser negativo"),
  porcentaje_punta_vendedora: yup
    .number()
    .when("tipo_operacion", {
      is: (value: string) => !value || value === "" || value === "Compra",
      then: (schema) =>
        schema
          .nullable()
          .transform((value, originalValue) => {
            // Si es string vacío, null o undefined, convertir a 0
            if (
              (typeof originalValue === "string" &&
                originalValue.trim() === "") ||
              value === null ||
              value === undefined ||
              isNaN(value)
            ) {
              return 0;
            }
            return value;
          })
          .min(0, "No puede ser negativo"),
      otherwise: (schema) =>
        schema
          .nullable()
          .transform((value, originalValue) => {
            // Si es null (campo vacío convertido), retornar undefined para que required lo detecte
            if (value === null || value === undefined) {
              return undefined;
            }
            // Si es NaN, también retornar undefined
            if (isNaN(value)) {
              return undefined;
            }
            return value;
          })
          .required("Porcentaje de punta vendedora es requerido")
          .typeError("Debe ser un número")
          .min(0, "No puede ser negativo"),
    })
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo"),
  punta_compradora: yup
    .boolean()
    .test(
      "puntas-requeridas",
      "Debe seleccionar al menos una punta (compradora o vendedora)",
      function (value) {
        const tipoOperacion = this.parent.tipo_operacion;
        const puntaVendedora = this.parent.punta_vendedora;
        // Para Compra: solo se necesita punta_compradora
        // Para otros tipos: al menos una debe estar marcada
        if (tipoOperacion === "Compra") {
          return true; // No hay validación cruzada para Compra
        }
        return value === true || puntaVendedora === true;
      }
    ),
  punta_vendedora: yup
    .boolean()
    .test(
      "punta-vendedora-requerida",
      "La punta vendedora es obligatoria para operaciones de Venta",
      function (value) {
        const tipoOperacion = this.parent.tipo_operacion;
        // Para Venta: punta_vendedora es obligatoria
        if (tipoOperacion === "Venta") {
          return value === true;
        }
        // Para Compra u otros tipos: no es obligatoria
        return true;
      }
    ),
  exclusiva: yup.boolean(),
  no_exclusiva: yup.boolean(),
  numero_sobre_reserva: yup.string().nullable(),
  numero_sobre_refuerzo: yup.string().nullable(),
  monto_sobre_reserva: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? 0
        : value
    ),
  monto_sobre_refuerzo: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? 0
        : value
    ),
  referido: yup.string().nullable(),
  compartido: yup.string().nullable(),
  porcentaje_compartido: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? 0
        : value
    ),
  porcentaje_referido: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? 0
        : value
    ),
  realizador_venta: yup
    .string()
    .nullable()
    .notRequired()
    .transform((value) => (value === "" ? null : value)),
  porcentaje_honorarios_asesor: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .nullable(),
  realizador_venta_adicional: yup.string().nullable(),
  porcentaje_honorarios_asesor_adicional: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .nullable(),
  estado: yup.string().required("El estado es requerido"),
  observaciones: yup.string().nullable(),
  pais: yup.string(),
  isFranchiseOrBroker: yup.number().nullable(),
  reparticion_honorarios_asesor: yup.number().nullable(),
  tipo_inmueble: yup
    .string()
    .nullable()
    .when("tipo_operacion", {
      is: (value: string) => value === "Venta" || value === "Compra",
      then: (schema) =>
        schema
          .required("El tipo de inmueble es requerido")
          .test(
            "not-empty",
            "El tipo de inmueble es requerido",
            (value) => value !== null && value !== undefined && value !== ""
          ),
      otherwise: (schema) => schema.nullable(),
    }),
  gastos_operacion: yup
    .number()
    .typeError("Debe ser un número")
    .min(0, "No puede ser negativo")
    .nullable()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() === ""
        ? 0
        : value
    ),
  captacion_no_es_mia: yup.boolean().nullable(),
  fecha_vencimiento_alquiler: yup
    .string()
    .nullable()
    .transform((value, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      return value;
    })
    .when("tipo_operacion", {
      is: (value: string) =>
        value === "Alquiler Tradicional" ||
        value === "Alquiler Temporal" ||
        value === "Alquiler Comercial",
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.nullable().transform(() => null),
    }),
});
