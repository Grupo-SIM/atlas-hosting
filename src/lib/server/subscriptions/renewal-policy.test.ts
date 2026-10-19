import { describe, expect, test } from "bun:test";
import { firstRenewalDate, nextRenewalDate } from "@/lib/vps/renewal-date";
import { daysUntilRenewal, renewalAttemptDay, renewalEmailMessage } from "./renewal-policy";

describe("VPS renewal calendar", () => {
  const purchase = new Date("2026-10-22T18:00:00-03:00");
  const renewal = firstRenewalDate(purchase, 1);
  test("purchase on X bills on X minus two next month", () => {
    expect(renewal.toISOString()).toBe("2026-11-20T21:00:00.000Z");
    expect(nextRenewalDate(renewal, 1).toISOString()).toBe("2026-12-20T21:00:00.000Z");
  });
  test("first attempt on X minus two; second on X minus one", () => {
    expect(renewalAttemptDay(renewal, new Date("2026-11-19T23:59:00-03:00"))).toBe(0);
    expect(renewalAttemptDay(renewal, new Date("2026-11-20T08:00:00-03:00"))).toBe(1);
    expect(renewalAttemptDay(renewal, new Date("2026-11-21T08:00:00-03:00"))).toBe(2);
  });
  test("reminders use Recife calendar regardless of purchase time", () => {
    expect(daysUntilRenewal(renewal, new Date("2026-11-05T09:00:00-03:00"))).toBe(15);
    expect(daysUntilRenewal(renewal, new Date("2026-11-12T23:00:00-03:00"))).toBe(8);
  });
  test("email shows contract amount and period and escapes plan markup", () => {
    const html = renewalEmailMessage("Cloud VPS <script>", 126.49, 3, renewal);
    expect(html).toContain("126,49");
    expect(html).toContain("3 meses");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("Pague pelo link abaixo até o dia seguinte à data de renovação. Caso contrário, prosseguiremos com o cancelamento da VPS e consequente apagamento dos dados. Se houver cartão cadastrado, a cobrança automática será tentada na data de renovação e, se falhar, no dia seguinte.");
    expect(html).not.toMatch(/contabo|namecheap|fornecedor|token/i);
  });
});
