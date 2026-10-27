import { expect, test } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";
import { checkoutDeadlineCondition } from "./checkout-deadline";

test("permits overdue renewal only for VPS without voucher and with cycle identity", () => {
  const condition = checkoutDeadlineCondition();
  if (!condition) throw new Error("Missing deadline condition");
  const query = new PgDialect().sqlToQuery(condition);
  expect(query.params).toEqual(["vps"]);
  expect(query.sql).toContain('"due_date" > now() or');
  expect(query.sql).toContain('"voucher_id" is null');
  expect(query.sql).toContain("->>'isRenewal' = 'true'");
  expect(query.sql).toContain("->>'subscriptionId', '') is not null");
  expect(query.sql).toContain("->>'renewalCycle', '') is not null");
});
