import { schema } from "@gds-si/shared-schemas/loginFormSchema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

describe("Login Form Schema", () => {
  it("valida correctamente datos válidos", async () => {
    const validData = {
      email: "juan@example.com",
      password: "password123",
    };

    await expect(schema.validate(validData)).resolves.toEqual(validData);
  });

  it("rechaza email inválido", async () => {
    const invalidData = {
      email: "email-invalido",
      password: "password123",
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "Correo inválido"
    );
  });

  it("rechaza email vacío", async () => {
    const invalidData = {
      email: "",
      password: "password123",
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "Correo es requerido"
    );
  });

  it("rechaza contraseña muy corta", async () => {
    const invalidData = {
      email: "juan@example.com",
      password: "12345", // menos de 6 caracteres
    };

    await expect(schema.validate(invalidData)).rejects.toThrow(
      "Contraseña debe tener al menos 6 caracteres"
    );
  });

  it("rechaza contraseña vacía", async () => {
    const invalidData = {
      email: "juan@example.com",
      password: "",
    };

    // Yup muestra el error de longitud mínima antes que el de requerido para strings vacíos
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "Contraseña debe tener al menos 6 caracteres"
    );
  });

  it("rechaza ambos campos vacíos", async () => {
    const invalidData = {
      email: "",
      password: "",
    };

    await expect(schema.validate(invalidData)).rejects.toThrow();
  });

  it("acepta contraseña de exactamente 6 caracteres", async () => {
    const validData = {
      email: "juan@example.com",
      password: "123456", // exactamente 6 caracteres
    };

    await expect(schema.validate(validData)).resolves.toEqual(validData);
  });

  it("acepta email con diferentes dominios", async () => {
    const testCases = [
      "test@gmail.com",
      "user@company.co.uk",
      "admin@sub.domain.org",
      "john.doe+label@example.com",
    ];

    for (const email of testCases) {
      const validData = {
        email,
        password: "password123",
      };
      await expect(schema.validate(validData)).resolves.toEqual(validData);
    }
  });
});
