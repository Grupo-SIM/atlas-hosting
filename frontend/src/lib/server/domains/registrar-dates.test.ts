import { describe, expect, test } from "bun:test";
import { getRegistrarDates } from "./registrar-dates";

describe("registrar dates", () => {
  const now = new Date("2026-10-02T12:00:00Z");

  test("formats Namecheap dates and detects expiration", () => {
    expect(getRegistrarDates("09/25/2025", "09/25/2026", now)).toEqual({
      expiryDate: "25/09/2026",
      registrationDate: "25/09/2025",
      status: "expired",
    });
    expect(getRegistrarDates("09/25/2026", "09/25/2027", now).status).toBe(
      "active"
    );
  });

  test("missing or invalid expiration remains unknown rather than active", () => {
    for (const expiry of [undefined, null, "", "N/A", "invalid date"]) {
      expect(getRegistrarDates("09/25/2026", expiry, now)).toEqual({
        expiryDate: "Indisponível",
        registrationDate: "25/09/2026",
        status: "unknown",
      });
    }
  });

  test("invalid creation date preserves valid expiration", () => {
    expect(getRegistrarDates("N/A", "09/25/2027", now)).toEqual({
      expiryDate: "25/09/2027",
      registrationDate: "Indisponível",
      status: "active",
    });
  });
});
