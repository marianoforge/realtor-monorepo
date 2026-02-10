import { createSchema } from "@gds-si/shared-schemas/registerFormSchema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const describe: any, it: any, expect: any;

describe("Register Form Schema", () => {
  describe("cuando es un usuario regular (no Google)", () => {
    const schema = createSchema(false);

    it("valida correctamente todos los campos requeridos", async () => {
      const validData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "Password1",
        confirmPassword: "Password1",
        currency: "USD",
        currencySymbol: "$",
        noUpdates: false,
      };

      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("rechaza email inválido", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "email-invalido",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "Password1",
        confirmPassword: "Password1",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "Correo inválido"
      );
    });

    it("rechaza contraseña muy corta", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "Pass1",
        confirmPassword: "Pass1",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La contraseña debe tener al menos 8 caracteres"
      );
    });

    it("rechaza contraseña sin mayúscula", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "password1",
        confirmPassword: "password1",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La contraseña debe contener al menos una mayúscula"
      );
    });

    it("rechaza contraseña sin minúscula", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "PASSWORD1",
        confirmPassword: "PASSWORD1",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La contraseña debe contener al menos una minúscula"
      );
    });

    it("rechaza contraseña sin número", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "Password",
        confirmPassword: "Password",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "La contraseña debe contener al menos un número"
      );
    });

    it("rechaza contraseñas que no coinciden", async () => {
      const invalidData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "Password1",
        confirmPassword: "Password2",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow(
        "Las contraseñas no coinciden"
      );
    });

    it("rechaza campos requeridos vacíos", async () => {
      const invalidData = {
        firstName: "",
        lastName: "",
        email: "",
        agenciaBroker: "",
        numeroTelefono: "",
        password: "",
        confirmPassword: "",
      };

      await expect(schema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe("cuando es un usuario de Google", () => {
    const schema = createSchema(true);

    it("no requiere contraseña para usuarios de Google", async () => {
      const validData = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        currency: "USD",
        currencySymbol: "$",
        noUpdates: false,
      };

      await expect(schema.validate(validData)).resolves.toEqual(validData);
    });

    it("ignora campos de contraseña si se proporcionan", async () => {
      const dataWithPasswords = {
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan@example.com",
        agenciaBroker: "Mi Agencia",
        numeroTelefono: "+54 11 1234 5678",
        password: "ignored",
        confirmPassword: "ignored",
        currency: "USD",
        currencySymbol: "$",
        noUpdates: false,
      };

      const result = await schema.validate(dataWithPasswords);
      // Para usuarios de Google, las contraseñas no son requeridas
      expect(result).toEqual(
        expect.objectContaining({
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan@example.com",
        })
      );
    });
  });
});
