import { beforeEach, expect, mock, test } from "bun:test";

let admin = { id: "admin", isAdmin: true };
let effective = "admin";
let target: any;
let sent: any[][];
let fail = false;
mock.module("@/lib/auth", () => ({
  getRealUser: async () => admin,
  getUser: async () => ({ id: effective }),
}));
mock.module("@/lib/db", () => ({
  db: {
    insert: () => ({ values: async () => {} }),
    query: { pgUser: { findFirst: async () => target } },
  },
}));
mock.module("@/lib/email/service", () => ({
  sendNotificationEmail: async (...args: any[]) => {
    if (fail) throw new Error("SMTP unavailable");
    sent.push(args);
  },
}));
const { sendUserEmailAction } = await import("./email-actions");
beforeEach(() => {
  admin = { id: "admin", isAdmin: true };
  effective = "admin";
  target = { email: "client@example.test", id: "client", name: "Client" };
  sent = [];
  fail = false;
});
test("only a real administrator outside impersonation can send", async () => {
  admin.isAdmin = false;
  expect((await sendUserEmailAction("client", "Subject", "Message")).ok).toBe(
    false
  );
  admin.isAdmin = true;
  effective = "client";
  expect((await sendUserEmailAction("client", "Subject", "Message")).ok).toBe(
    false
  );
  expect(sent).toHaveLength(0);
});
test("validates draft and recipient before sending", async () => {
  expect(
    (await sendUserEmailAction("client", "Injected\nHeader", "Message")).ok
  ).toBe(false);
  expect((await sendUserEmailAction("client", "Subject", " ")).ok).toBe(false);
  target = null;
  expect((await sendUserEmailAction("client", "Subject", "Message")).ok).toBe(
    false
  );
  expect(sent).toHaveLength(0);
});
test("escapes custom text, uses recipient from database and links to payments", async () => {
  expect(
    (
      await sendUserEmailAction(
        "client",
        "Update card",
        "<script>bad()</script>\nNext"
      )
    ).ok
  ).toBe(true);
  expect(sent[0][0]).toBe("client@example.test");
  expect(sent[0][4]).toBe("&lt;script&gt;bad()&lt;/script&gt;<br>Next");
  expect(sent[0][6]).toEndWith("/settings?tab=payment");
  expect(sent[0][9]).toBe(true);
});
test("SMTP failure never reports success", async () => {
  fail = true;
  expect((await sendUserEmailAction("client", "Subject", "Message")).ok).toBe(
    false
  );
});
