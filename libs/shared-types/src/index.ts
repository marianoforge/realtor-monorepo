interface BaseState<T> {
  isLoading: boolean;
  error: string | null;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchItems: (userID: string) => Promise<void>;
  setItems: (items: T[]) => void;
}

export interface Operation {
  reparticion_honorarios_asesor: number;
  punta_compradora: boolean;
  punta_vendedora: boolean;
  id: string;
  fecha_operacion: string;
  fecha_captacion: string;
  direccion_reserva: string;
  localidad_reserva: string;
  provincia_reserva: string;
  pais: string;
  numero_casa: string;
  tipo_operacion: string;
  valor_reserva: number;
  numero_sobre_reserva?: string | null;
  numero_sobre_refuerzo?: string | null;
  monto_sobre_reserva?: number | null;
  monto_sobre_refuerzo?: number | null;
  porcentaje_honorarios_asesor: number;
  porcentaje_honorarios_broker: number;
  porcentaje_punta_compradora: number;
  porcentaje_punta_vendedora: number;
  porcentaje_compartido?: number | null;
  porcentaje_referido?: number | null;
  honorarios_broker: number;
  honorarios_asesor: number;
  referido?: string | null;
  compartido?: string | null;
  realizador_venta: string;
  realizador_venta_adicional?: string | null;
  porcentaje_honorarios_asesor_adicional?: number | null;
  estado: string;
  user_uid: string;
  user_uid_adicional?: string | null;
  teamId: string;
  observaciones?: string | null;
  isFranchiseOrBroker?: number | null;
  exclusiva?: boolean | string;
  no_exclusiva?: boolean | string;
  fecha_reserva?: string;
  tipo_inmueble?: string | null;
  gastos_operacion?: number | null;
  beneficio_despues_gastos?: number | null;
  rentabilidad?: number | null;
  razon_caida?: string | null;
  captacion_no_es_mia?: boolean | null;
  fecha_vencimiento_alquiler?: string | null;
}

export interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  address?: string;
  eventType: string;
  syncWithGoogle?: boolean;
  googleCalendarId?: string;
  completed?: boolean;
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  address: string;
  eventType: string;
  user_uid: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Google Calendar integration
  google?: {
    calendarId: string;
    eventId: string;
    lastSyncAt: number;
    htmlLink?: string;
  };
  syncWithGoogle?: boolean;
  // Campo para marcar si el evento fue realizado
  completed?: boolean;
}

export interface EventsState extends BaseState<Event> {
  events: Event[];
  fetchEvents: (userID: string) => Promise<void>;
}

export interface Expense {
  id?: string;
  date: string;
  amount: number;
  amountInDollars: number;
  expenseType: string;
  description: string;
  dollarRate: number;
  user_uid?: string;
  otherType?: string;
  isRecurring?: boolean;
  operationType?: "egreso" | "ingreso";
}

export interface ExpenseFormData {
  date: string;
  amount: number;
  amountInDollars?: number;
  expenseType: string;
  description?: string;
  dollarRate?: number;
  otherType?: string;
  isRecurring?: boolean;
}

export interface ExpenseAgents {
  id: string;
  firstName: string;
  lastName: string;
  expenses: Expense[];
  totalInPesos: number;
  totalInDollars: number;
}

export interface ExpenseAgentsFormData {
  date: string;
  amount: number;
  amountInDollars?: number;
  expenseType: string;
  description?: string;
  dollarRate: number;
  otherType?: string;
  teamMember: string;
}

export interface ExpensesState extends BaseState<Expense> {
  expenses: Expense[];
  items: Expense[];
  totals: {
    totalAmount: number;
    totalAmountInDollars: number;
    totalExpenses: number;
    valor_reserva: number;
    suma_total_de_puntas: number;
    honorarios_broker: number;
    honorarios_asesor: number;
  };
  setExpenses: (expenses: Expense[]) => void;
  calculateTotals: () => void;
  updateExpense: (id: string, newData: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  fetchExpenses: (userID: string) => Promise<void>;
  setItems: (items: Expense[]) => void;
  fetchItems: (userID: string) => Promise<void>;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface UserData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  numeroTelefono: string | null;
  agenciaBroker: string | null;
  objetivoAnual: number | null;
  // Objetivos anuales por año (ej: { "2025": 50000000, "2026": 60000000 })
  objetivosAnuales?: Record<string, number>;
  role: string | null;
  uid: string | null;
  trialEndsAt: Date | { toDate: () => Date } | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currency: string | null;
  currencySymbol: string | null;
  // Nuevos campos para manejo de trial
  subscriptionStatus:
    | "trialing"
    | "active"
    | "canceled"
    | "expired"
    | "past_due"
    | null;
  trialStartDate: Date | { toDate: () => Date } | null;
  trialEndDate: Date | { toDate: () => Date } | null;
  paymentNotificationShown?: boolean;
  // Campos para recordatorio de trial
  trialReminderSent?: boolean;
  trialReminderSentAt?: string | null;
  // Campo para modal de bienvenida
  welcomeModalShown?: boolean;
  // Campos para notificación de cambio de precios
  pricingChangeNotificationShown?: boolean;
  pricingChangeNotificationShownAt?: string | null;
  // Campos para manejo de suscripciones canceladas
  subscriptionCanceledAt?: string | null;
  lastSyncAt?: string | null;
  // Campo para API de Tokko Broker
  tokkoApiKey?: string | null;
}

export interface UserDataState extends BaseState<UserData> {
  userData: UserData | null;
  role: string | null;
  items: UserData[];
  setUserData: (userData: UserData | null) => void;
  setUserRole: (role: string | null) => void;
  clearUserData: () => void;
  fetchUserData: (userID: string) => Promise<void>;
}

export interface UserState {
  userID: string | null;
  role: string | null;
  setUserID: (id: string | null) => void;
  setUserRole: (role: string | null) => void;
  initializeAuthListener: () => () => void;
  getAuthToken: () => Promise<string | null>;
}

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  onAccept?: () => void;
  secondButtonText?: string;
  onSecondButtonClick?: () => void;
  className?: string;
  thirdButtonText?: string;
  onThirdButtonClick?: () => void;
  messageClassName?: string;
  showTextarea?: boolean;
  textareaValue?: string;
  onTextareaChange?: (value: string) => void;
  textareaPlaceholder?: string;
}

export interface UserInfoProps {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  agenciaBroker: string;
  numeroTelefono: string;
  currency: string;
  currencySymbol: string;
}

export interface LoginData {
  email: string;
  password: string;
}
export interface RegisterRequestBody {
  email: string;
  password: string;
  agenciaBroker: string;
  numeroTelefono: string;
  firstName: string;
  lastName: string;
  priceId: string;
  verificationToken: string;
  currency: string;
  currencySymbol: string;
  captchaToken: string;
  noUpdates: boolean;
}

export interface LoginRequestBody {
  email?: string;
  password?: string;
  googleAuth?: boolean;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  numeroTelefono: string;
  teamLeadID?: string;
  objetivoAnual?: number;
  operaciones: Operation[];
}

export interface UserWithOperations {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  agenciaBroker?: string;
  operaciones: Operation[];
}

export interface TeamMemberRequestBody {
  firstName: string;
  lastName: string;
  email?: string | null;
  numeroTelefono?: string | null;
  objetivoAnual?: number | null;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  tooltip?: string;
  onSort?: () => void;
  isSortedAsc?: boolean;
}

export interface SessionType {
  id: string;
  amount_total: number;
  payment_status: string;
  subscription: string | { id: string; [key: string]: string };
  customer: string | { id: string; [key: string]: string };
  customer_details: {
    email: string;
  };
  line_items?: {
    data: { price: { id: string } }[];
  };
  metadata?: {
    userId?: string;
    fromRegistration?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export interface Prospect {
  id: string;
  nombre_cliente: string;
  email: string;
  telefono: string;
  estado_prospeccion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  user_uid: string;
  observaciones?: string | null;
}

// Instant Messaging Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: "text" | "system" | "reminder";
  // Campos para recordatorios de eventos
  eventId?: string;
  reminderType?: "oneWeekBefore" | "oneDayBefore" | "sameDay";
}

export interface MessagingUser {
  uid: string;
  name: string;
  email: string;
  fcmToken?: string;
  lastSeen?: string;
  online?: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: string;
  unreadCount: number;
}

export interface MessagingState {
  messages: Message[];
  conversations: ChatConversation[];
  currentConversation: string | null;
  fcmToken: string | null;
  isLoading: boolean;
  error: string | null;
  users: MessagingUser[];

  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setConversations: (conversations: ChatConversation[]) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  setFcmToken: (token: string | null) => void;
  setUsers: (users: MessagingUser[]) => void;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  fetchConversations: (includeCurrentUser?: boolean) => Promise<void>;
  initializeMessaging: () => Promise<void>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

// Google Calendar Types
export interface GoogleCalendar {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  calendars: GoogleCalendar[];
}

export interface GoogleOAuthResponse {
  success: boolean;
  message: string;
}

export interface GoogleEventResponse {
  googleEventId: string;
  htmlLink: string;
  success: boolean;
}
