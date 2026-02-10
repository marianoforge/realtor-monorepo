import { safeToDate } from "@/common/utils/firestoreUtils";
import { Timestamp } from "firebase/firestore";

describe("safeToDate", () => {
  it("should return null for null input", () => {
    expect(safeToDate(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(safeToDate(undefined)).toBeNull();
  });

  it("should return the same Date object if input is already a Date", () => {
    const date = new Date("2025-12-01T12:00:00Z");
    const result = safeToDate(date);
    expect(result).toEqual(date);
  });

  it("should convert a valid Firestore Timestamp to Date", () => {
    const timestamp = Timestamp.fromDate(new Date("2025-12-01T12:00:00Z"));
    const result = safeToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2025-12-01T12:00:00.000Z");
  });

  it("should parse a valid date string", () => {
    const dateString = "2025-12-01T12:00:00Z";
    const result = safeToDate(dateString);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2025-12-01T12:00:00.000Z");
  });

  it("should return null for invalid date string", () => {
    const invalidDateString = "not-a-date";
    const result = safeToDate(invalidDateString);
    expect(result).toBeNull();
  });

  it("should handle object with _seconds and _nanoseconds", () => {
    const timestampLike = {
      _seconds: 1733058000,
      _nanoseconds: 0,
    };
    const result = safeToDate(timestampLike as any);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(1733058000 * 1000);
  });

  it("should return null for object without toDate method or _seconds", () => {
    const invalidObject = { someField: "value" };
    const result = safeToDate(invalidObject as any);
    expect(result).toBeNull();
  });

  it("should handle mock Timestamp with toDate method", () => {
    const mockTimestamp = {
      toDate: () => new Date("2025-12-01T12:00:00Z"),
    };
    const result = safeToDate(mockTimestamp as any);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe("2025-12-01T12:00:00.000Z");
  });
});
