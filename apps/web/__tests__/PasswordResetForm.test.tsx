/* eslint-disable no-undef */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";

import PasswordResetForm from "@/components/PrivateComponente/PasswordResetForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any, beforeEach: any, jest: any;

// Mock de la API de auth
jest.mock("@/lib/api/auth", () => ({
  resetPassword: jest.fn(),
}));

import { resetPassword } from "@/lib/api/auth";
const mockResetPassword = resetPassword as jest.MockedFunction<
  typeof resetPassword
>;

// Mock de Next.js components
jest.mock("next/link", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockLink = ({ children, href, title }: any) => (
    <a href={href} title={title}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MockImage = ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

describe("PasswordResetForm", () => {
  beforeEach(() => {
    mockResetPassword.mockClear();
  });

  describe("Renderizado", () => {
    it("debe renderizar el formulario correctamente", () => {
      render(<PasswordResetForm />);

      expect(
        screen.getByText("Recuperación de Contraseña")
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Correo electrónico")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Enviar enlace de recuperación")
      ).toBeInTheDocument();
      expect(screen.getByAltText("Logo")).toBeInTheDocument();
    });

    it("debe renderizar el enlace al home", () => {
      render(<PasswordResetForm />);

      const homeLink = screen.getByTitle("Home");
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Estados de loading", () => {
    it("debe mostrar loading state cuando se envía el formulario", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      // Mock con promise que no se resuelve inmediatamente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockResetPassword.mockReturnValue(promise);

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "test@example.com" },
        });
        fireEvent.click(submitButton);
      });

      // Verificar que aparece el estado de loading
      expect(screen.getByText("Enviando...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Resolver el promise
      await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolvePromise as any)({ message: "Email enviado" });
      });

      await waitFor(() => {
        expect(screen.queryByText("Enviando...")).not.toBeInTheDocument();
      });
    });

    it("debe mostrar spinner durante loading", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockResetPassword.mockReturnValue(promise);

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "test@example.com" },
        });
        fireEvent.click(screen.getByText("Enviar enlace de recuperación"));
      });

      // Verificar que el spinner está presente
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();

      await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolvePromise as any)({ message: "Email enviado" });
      });

      await waitFor(() => {
        const spinnerAfter = document.querySelector(".animate-spin");
        expect(spinnerAfter).not.toBeInTheDocument();
      });
    });
  });

  describe("Manejo de éxito", () => {
    it("debe mostrar mensaje de éxito cuando el email se envía correctamente", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      mockResetPassword.mockResolvedValue({
        message: "Se ha enviado un enlace de restablecimiento de contraseña.",
      });

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "success@example.com" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Se ha enviado un enlace de restablecimiento de contraseña."
          )
        ).toBeInTheDocument();
      });

      expect(mockResetPassword).toHaveBeenCalledWith("success@example.com");
    });

    it("debe limpiar errores previos al mostrar éxito", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      // Primer envío con error
      mockResetPassword.mockRejectedValueOnce({
        response: { data: { message: "Error inicial" } },
      });

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "test@example.com" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Error inicial")).toBeInTheDocument();
      });

      // Segundo envío exitoso
      mockResetPassword.mockResolvedValue({
        message: "Email enviado correctamente",
      });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Email enviado correctamente")
        ).toBeInTheDocument();
        expect(screen.queryByText("Error inicial")).not.toBeInTheDocument();
      });
    });
  });

  describe("Manejo de errores", () => {
    it("debe mostrar error cuando el usuario no está registrado", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      mockResetPassword.mockRejectedValue({
        response: {
          data: {
            message:
              "Este correo electrónico no está registrado. Por favor, regístrate primero para crear tu cuenta.",
          },
        },
      });

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "notregistered@example.com" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Este correo electrónico no está registrado. Por favor, regístrate primero para crear tu cuenta."
          )
        ).toBeInTheDocument();
      });
    });

    it("debe mostrar enlace de registro cuando el usuario no está registrado", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      mockResetPassword.mockRejectedValue({
        response: {
          data: {
            message:
              "Este correo electrónico no está registrado. Por favor, regístrate primero para crear tu cuenta.",
          },
        },
      });

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "notregistered@example.com" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        const registerLink = screen.getByText("Haz clic aquí para registrarte");
        expect(registerLink).toBeInTheDocument();
        expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
      });
    });

    it("debe mostrar mensaje de error genérico", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      mockResetPassword.mockRejectedValue(new Error("Network error"));

      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "test@example.com" },
        });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            "Error al enviar el correo de restablecimiento de contraseña."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Integración completa", () => {
    it("debe manejar el flujo completo de reset password exitoso", async () => {
      render(<PasswordResetForm />);

      const emailInput = screen.getByPlaceholderText("Correo electrónico");
      const submitButton = screen.getByText("Enviar enlace de recuperación");

      mockResetPassword.mockResolvedValue({
        message:
          "Se ha enviado un enlace de restablecimiento de contraseña a usuario@ejemplo.com.",
      });

      // Estado inicial
      expect(submitButton).not.toBeDisabled();
      expect(screen.queryByText("Enviando...")).not.toBeInTheDocument();

      // Ingreso de email y envío
      await act(async () => {
        fireEvent.change(emailInput, {
          target: { value: "usuario@ejemplo.com" },
        });
        fireEvent.click(submitButton);
      });

      // Verificar que la API fue llamada
      expect(mockResetPassword).toHaveBeenCalledWith("usuario@ejemplo.com");

      // Estado final
      await waitFor(() => {
        expect(
          screen.getByText(
            "Se ha enviado un enlace de restablecimiento de contraseña a usuario@ejemplo.com."
          )
        ).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
        expect(screen.queryByText("Enviando...")).not.toBeInTheDocument();
      });
    });
  });
});
