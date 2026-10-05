import { describe, expect, test } from "bun:test";
import { deliverEmergencyAlert, getEmergencyRecipients } from "./emergency-alerts";

describe("emergency recipients", () => {
  test("normalizes spaces and duplicates, uses legacy fallback", () => {
    expect(getEmergencyRecipients({ EMERGENCY_ALERT_EMAILS: " A@EXAMPLE.COM, b@example.com, a@example.com, ", DOMAIN_EMAIL: "legacy@example.com" })).toEqual(["a@example.com", "b@example.com"]);
    expect(getEmergencyRecipients({ EMERGENCY_ALERT_EMAILS: "  ", DOMAIN_EMAIL: " legacy@example.com " })).toEqual(["legacy@example.com"]);
    expect(getEmergencyRecipients({})).toEqual([]);
  });
  test("individual failure does not skip next recipient", async () => {
    const sent: string[] = [];
    expect(await deliverEmergencyAlert(async email => {
      sent.push(email);
      if (email === "first") throw new Error("simulated SMTP failure");
    }, ["first", "second"])).toBe(true);
    expect(sent).toEqual(["first", "second"]);
  });
  test("no successful delivery reports false", async () => {
    expect(await deliverEmergencyAlert(async () => { throw new Error("offline"); }, ["first"])).toBe(false);
    expect(await deliverEmergencyAlert(async () => { throw new Error("must not send"); }, [])).toBe(false);
  });
});
