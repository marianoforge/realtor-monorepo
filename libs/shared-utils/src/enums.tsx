export enum CalendarView {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export enum CalendarAction {
  PREV = "PREV",
  NEXT = "NEXT",
  TODAY = "TODAY",
}

export enum OperationStatus {
  TODAS = "all",
  EN_CURSO = "En Curso",
  CERRADA = "Cerrada",
  CAIDA = "Caída",
}

export enum ALQUILER {
  ALQUILER = "Alquiler",
}

export enum OperationType {
  ALL = "all",
  VENTA = "Venta",
  COMPRA = "Compra",
  ALQUILER_TRADICIONAL = "Alquiler Tradicional",
  DESARROLLO_INMOBILIARIO = "Desarrollo Inmobiliario",
  COCHERA = "Cochera",
  ALQUILER_TEMPORAL = "Alquiler Temporal",
  ALQUILER_COMERCIAL = "Alquiler Comercial",
  FONDO_DE_COMERCIO = "Fondo de Comercio",
  DESARROLLO = "Desarrollo",
  LOTEAMIENTO = "Loteamiento",
  LOTES_PARA_DESARROLLOS = "Lotes Para Desarrollos",
}

export enum APIMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export enum QueryKeys {
  TEAM_MEMBERS_OPS = "teamMembersOps",
  TEAM_MEMBERS = "teamMembers",
  TEAM_DATA = "teamData",
  USERS_WITH_OPERATIONS = "usersWithOperations",
  EXPENSES = "expenses",
  EXPENSES_AGENTS = "expensesAgents",
  OPERATIONS = "operations",
  EVENTS = "events",
  SUBSCRIPTION_DATA = "subscriptionData",
  USER_DATA = "userData",
}

export enum UserRole {
  TEAM_LEADER_BROKER = "team_leader_broker",
  AGENTE_ASESOR = "agente_asesor",
  DEFAULT = "",
}

export enum OperationData {
  VALOR_RESERVA = "valor_reserva",
  REALIZADOR_VENTA = "realizador_venta",
  PORCENTAJE_HONORARIOS_ASESOR = "porcentaje_honorarios_asesor",
  PORCENTAJE_HONORARIOS_BROKER = "porcentaje_honorarios_broker",
  HONORARIOS_ASESOR = "honorarios_asesor",
  HONORARIOS_BROKER = "honorarios_broker",
  HONORARIOS_TEAM_LEADER = "honorarios_team_leader",
  PORCENTAJE_PUNTA_COMPRADORA = "porcentaje_punta_compradora",
  PORCENTAJE_PUNTA_VENDEDORA = "porcentaje_punta_vendedora",
}

export enum YearFilter {
  DOS_MIL_VEINTITRES = 2023,
  DOS_MIL_VEINTICUATRO = 2024,
  DOS_MIL_VEINTICINCO = 2025,
}

export enum PATHS {
  LOGIN = "/login",
  REGISTER = "/register",
  RESET_PASSWORD = "/reset-password",
  RESERVATION_INPUT = "/reservationInput",
  DASHBOARD = "/dashboard",
  EVENT_FORM = "/eventForm",
  CALENDAR = "/calendar",
  SETTINGS = "/settings",
  OPERATIONS_LIST = "/operationsList",
  EXPENSES = "/expenses",
  EXPENSES_LIST = "/expensesList",
  EXPENSES_AGENTS_LIST = "/expensesAgentsList",
  AGENTS = "/agents",
  EXPENSES_BROKER = "/expensesBroker",
  EXPENSES_AGENTS_FORM = "/expensesAgentsForm",
  PROJECTIONS = "/projections",
  PROSPECTION = "/prospection",
  CARTERA = "/cartera",
  FAQS = "/faqs",
  NOT_AUTHORIZED = "/not-authorized",
}

export enum MonthNames {
  ENERO = "Enero",
  FEBRERO = "Febrero",
  MARZO = "Marzo",
  ABRIL = "Abril",
  MAYO = "Mayo",
  JUNIO = "Junio",
  JULIO = "Julio",
  AGOSTO = "Agosto",
  SEPTIEMBRE = "Septiembre",
  OCTUBRE = "Octubre",
  NOVIEMBRE = "Noviembre",
  DICIEMBRE = "Diciembre",
}

export enum ExpenseType {
  ALL = "all",
  FEE_FRANQUICIA = "Fee (Franquicia)",
  CARTELERIA = "Carteleria",
  MARKETING = "Marketing",
  PUBLICIDAD = "Publicidad",
  VARIOS = "Varios",
  CONTADOR = "Contador",
  SUELDOS_EMPLEADOS = "Sueldos Empleados",
  MATRICULA = "Matrícula",
  ABAO = "ABAO",
  CAPACITACION = "Capacitación",
  FIANZA = "Fianza",
  ALQUILER_OFICINA = "Alquiler Oficina",
  PORTALES_INMOBILIARIOS = "Portales Inmobiliarios",
  CRM = "CRM",
  VIATICOS = "Viaticos",
  EXPENSAS = "Expensas",
  SERVICIOS_OFICINA = "Servicios de Oficina",
  OTROS = "Otros",
}

export enum TipodeVentas {
  CASA = "Casa",
  PH = "PH",
  DEPARTAMENTOS = "Departamentos",
  LOCALES_COMERCIALES = "Locales Comerciales",
  OFICINAS = "Oficinas",
  NAVE_INDUSTRIAL = "Naves Industriales",
  TERRENOS = "Terrenos",
  CHACRAS = "Chacras",
  OTRO = "Otro",
}

export enum ProspectionStatus {
  PROSPECTADO = "Prospectado",
  PRE_LISTING_BUYING = "Pre-listing / Pre-buying",
  ACM = "ACM",
  CAPTADO_TIPO_A = "Captado - Tipo A",
  CAPTADO_TIPO_B = "Captado - Tipo B",
  CAPTADO_TIPO_C = "Captado - Tipo C",
  NEGOCIACION = "Negociación",
  RESERVADO = "Reservado",
  REFUERZO = "Refuerzo",
  VENDIDO = "Vendido",
}

export enum EventType {
  CONTACTO_TELEFONICO_WHATSAPP = "Contacto telefónico / WhatsApp",
  CONTACTO_EMAIL = "Contacto por email",
  INVITACION_EVENTO = "Invitación a un evento",
  COLOCACION_CARTEL = "Colocación de cartel",
  CAFE_CARA_A_CARA = "Café / Cara a cara",
  NOTA_PERSONAL = "Nota personal",
  RELLAMADO = "Rellamado",
  INFORME_DE_GESTION = "Informe de Gestión",
  REUNION_PRE_BUYING = "Reunión de pre-buying",
  REUNION_PRE_LISTING = "Reunión de pre-listing",
  PRESENTACION_ACM = "Presentación de ACM",
  MUESTRA = "Muestra",
  MODIFICACION_PRECIO = "Modificación de precio",
  OFERTA = "Oferta",
  RESERVA = "Reserva",
  REFUERZO = "Refuerzo",
  BOLETO = "Boleto",
  ESCRITURA = "Escritura",
  ACCIONES_FIDELIZACION_POST_VENTA = "Acciones de fidelización post-venta",
  PEDIDO_DE_REFERIDO = "Pedido de referido",
}

/**
 * Columnas del WAR (Week Activity Report)
 */
export type WARColumn =
  | "actividadVerde"
  | "contactosReferidos"
  | "preBuying"
  | "preListing"
  | "captaciones"
  | "reservas"
  | "cierres"
  | "postVenta";

/**
 * Mapeo de cada tipo de evento a su columna correspondiente en el WAR
 */
export const EVENT_TYPE_TO_WAR_COLUMN: Record<string, WARColumn> = {
  // Prospección → actividadVerde
  [EventType.CONTACTO_TELEFONICO_WHATSAPP]: "actividadVerde",
  [EventType.CONTACTO_EMAIL]: "actividadVerde",
  [EventType.INVITACION_EVENTO]: "actividadVerde",
  [EventType.COLOCACION_CARTEL]: "actividadVerde",
  [EventType.NOTA_PERSONAL]: "actividadVerde",

  // Contactos o Referidos → contactosReferidos
  [EventType.CAFE_CARA_A_CARA]: "contactosReferidos",
  [EventType.RELLAMADO]: "contactosReferidos",

  // Pre Buying → preBuying
  [EventType.REUNION_PRE_BUYING]: "preBuying",

  // Pre Listing → preListing
  [EventType.REUNION_PRE_LISTING]: "preListing",
  [EventType.PRESENTACION_ACM]: "preListing",
  [EventType.MODIFICACION_PRECIO]: "preListing",

  // Captaciones → captaciones
  [EventType.MUESTRA]: "captaciones",
  [EventType.INFORME_DE_GESTION]: "captaciones",

  // Reservas → reservas
  [EventType.OFERTA]: "reservas",
  [EventType.RESERVA]: "reservas",
  [EventType.REFUERZO]: "reservas",

  // Cierres → cierres
  [EventType.BOLETO]: "cierres",
  [EventType.ESCRITURA]: "cierres",

  // Post-venta → postVenta
  [EventType.ACCIONES_FIDELIZACION_POST_VENTA]: "postVenta",
  [EventType.PEDIDO_DE_REFERIDO]: "postVenta",
};
