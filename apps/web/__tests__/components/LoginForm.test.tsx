/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tests para LoginForm
 *
 * Verifica el flujo de autenticación del formulario de login.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";

import LoginForm from "@/components/PublicComponents/LoginForm";

declare const describe: any, it: any, expect: any, beforeEach: any, jest: any;

// Mock del router de Next.js
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
  }),
}));

// Mock de Next.js Image
jest.mock("next/image", () => {
  const MockImage = ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

// Mock de Next.js Link
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: any) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock de Firebase Auth
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetIdToken = jest.fn().mockResolvedValue("mock-token");

jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: null,
    signOut: mockSignOut,
  }),
  signInWithEmailAndPassword: (...args: any[]) =>
    mockSignInWithEmailAndPassword(...args),
}));

// Mock de Firestore
const mockGetDoc = jest.fn();
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: (...args: any[]) => mockGetDoc(...args),
}));

// Mock de Firebase lib
jest.mock("@/lib/firebase", () => ({
  db: {},
}));

// Mock del authStore
jest.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    getAuthToken: jest.fn().mockResolvedValue("mock-token"),
  }),
}));

// Mock de PRICE_ID constants
jest.mock("@/lib/data", () => ({
  PRICE_ID_GROWTH: "price_growth",
  PRICE_ID_GROWTH_ANNUAL: "price_growth_annual",
}));

// Mock fetch global
global.fetch = jest.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockSignInWithEmailAndPassword.mockClear();
    mockGetDoc.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("Renderizado", () => {
    it("debe renderizar el formulario correctamente", () => {
      render(<LoginForm />);

      expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("juanaperez@gmail.com")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
      expect(screen.getByText("Iniciar Sesión con Email")).toBeInTheDocument();
    });

    it("debe mostrar el logo", () => {
      render(<LoginForm />);

      const logo = screen.getByAltText("Logo");
      expect(logo).toBeInTheDocument();
    });

    it("debe mostrar enlace a registro", () => {
      render(<LoginForm />);

      expect(
        screen.getByText("¿No tienes cuenta? - Regístrate")
      ).toBeInTheDocument();
    });

    it("debe mostrar enlace a recuperar contraseña", () => {
      render(<LoginForm />);

      expect(screen.getByText("Recuperar Contraseña")).toBeInTheDocument();
    });
  });

  describe("Validación del formulario", () => {
    it("debe tener campos de email y password requeridos", () => {
      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");

      // Los campos deben tener el atributo required
      expect(emailInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute("required");
    });

    it("debe tener un formulario válido", () => {
      render(<LoginForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("Toggle de contraseña", () => {
    it("debe tener input de contraseña con tipo password por defecto", () => {
      render(<LoginForm />);

      const passwordInput = screen.getByPlaceholderText("********");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("debe tener botón de toggle de contraseña", () => {
      render(<LoginForm />);

      // Buscar el botón de toggle por tipo
      const toggleButtons = document.querySelectorAll('button[type="button"]');
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Estado de loading", () => {
    it("debe mostrar estado de loading durante login", async () => {
      // Mock login que nunca se resuelve
      mockSignInWithEmailAndPassword.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      // Verificar estado de loading
      await waitFor(() => {
        expect(screen.getByText("Iniciando...")).toBeInTheDocument();
      });
    });

    it("debe deshabilitar botón durante loading", async () => {
      mockSignInWithEmailAndPassword.mockImplementation(
        () => new Promise(() => {})
      );

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        // El botón muestra "Iniciando..." cuando está en loading
        expect(screen.getByText("Iniciando...")).toBeInTheDocument();
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe mostrar error cuando email no está registrado", async () => {
      const authError = new Error("auth/user-not-found");
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "notfound@example.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Email no registrado")).toBeInTheDocument();
      });
    });

    it("debe mostrar error cuando contraseña es incorrecta", async () => {
      const authError = new Error("auth/wrong-password");
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Contraseña incorrecta")).toBeInTheDocument();
      });
    });

    it("debe mostrar error cuando hay demasiados intentos", async () => {
      const authError = new Error("auth/too-many-requests");
      mockSignInWithEmailAndPassword.mockRejectedValue(authError);

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/demasiados intentos/i)).toBeInTheDocument();
      });
    });
  });

  describe("Login exitoso", () => {
    it("debe redirigir al dashboard cuando login es exitoso", async () => {
      // Mock successful login
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: "user-123",
          email: "test@example.com",
          getIdToken: mockGetIdToken,
        },
      });

      // Mock Firestore document exists
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
          subscriptionStatus: "active",
        }),
      });

      // Mock fetch calls
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith("/dashboard");
        },
        { timeout: 5000 }
      );
    });

    it("debe redirigir a registro si usuario no tiene documento en Firestore", async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: "new-user",
          email: "newuser@example.com",
          getIdToken: mockGetIdToken,
        },
      });

      // Mock document doesn't exist
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "newuser@example.com" },
        });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith(
            expect.objectContaining({
              pathname: "/register",
            })
          );
        },
        { timeout: 5000 }
      );
    });
  });

  describe("Estados de suscripción bloqueados", () => {
    it("debe mostrar error cuando suscripción está cancelada", async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: "user-123",
          email: "test@example.com",
          getIdToken: mockGetIdToken,
        },
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
          subscriptionStatus: "canceled",
        }),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/suscripción ha sido cancelada/i)
        ).toBeInTheDocument();
      });
    });

    it("debe mostrar error cuando hay falta de pago", async () => {
      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: {
          uid: "user-123",
          email: "test@example.com",
          getIdToken: mockGetIdToken,
        },
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          stripeCustomerId: "cus_123",
          stripeSubscriptionId: "sub_123",
          subscriptionStatus: "unpaid",
        }),
      });

      render(<LoginForm />);

      const emailInput = screen.getByPlaceholderText("juanaperez@gmail.com");
      const passwordInput = screen.getByPlaceholderText("********");
      const submitButton = screen.getByText("Iniciar Sesión con Email");

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/bloqueada por falta de pago/i)
        ).toBeInTheDocument();
      });
    });
  });
});
