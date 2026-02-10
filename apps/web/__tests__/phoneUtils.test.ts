/// <reference types="jest" />

import {
  cleanPhoneNumber,
  isValidPhoneFormat,
  formatPhoneForDisplay,
} from "@gds-si/shared-utils";

describe("phoneUtils", () => {
  describe("cleanPhoneNumber", () => {
    test("should remove spaces from phone number", () => {
      expect(cleanPhoneNumber("+54 11 1234 5678")).toBe("+541112345678");
    });

    test("should remove all non-numeric characters except +", () => {
      expect(cleanPhoneNumber("+54 (11) 1234-5678")).toBe("+541112345678");
    });

    test("should handle phone number without +", () => {
      expect(cleanPhoneNumber("11 1234 5678")).toBe("1112345678");
    });

    test("should return empty string for undefined", () => {
      expect(cleanPhoneNumber(undefined)).toBe("");
    });

    test("should return empty string for empty string", () => {
      expect(cleanPhoneNumber("")).toBe("");
    });

    test("should preserve + at the beginning", () => {
      expect(cleanPhoneNumber("+1 234 567 8900")).toBe("+12345678900");
    });
  });

  describe("isValidPhoneFormat", () => {
    test("should validate correct phone numbers", () => {
      expect(isValidPhoneFormat("+5411123456789")).toBe(true);
      expect(isValidPhoneFormat("1234567")).toBe(true);
      expect(isValidPhoneFormat("+12345678901234")).toBe(true);
    });

    test("should reject too short numbers", () => {
      expect(isValidPhoneFormat("123456")).toBe(false);
    });

    test("should reject too long numbers", () => {
      expect(isValidPhoneFormat("+1234567890123456")).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isValidPhoneFormat(undefined)).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(isValidPhoneFormat("")).toBe(false);
    });
  });

  describe("formatPhoneForDisplay", () => {
    test("should format Argentine phone numbers", () => {
      expect(formatPhoneForDisplay("+541112345678")).toBe("+54 11 1234 5678");
    });

    test("should return cleaned number for non-Argentine numbers", () => {
      expect(formatPhoneForDisplay("+1 234 567 8900")).toBe("+12345678900");
    });

    test("should handle undefined", () => {
      expect(formatPhoneForDisplay(undefined)).toBe("");
    });

    test("should handle empty string", () => {
      expect(formatPhoneForDisplay("")).toBe("");
    });
  });
});
