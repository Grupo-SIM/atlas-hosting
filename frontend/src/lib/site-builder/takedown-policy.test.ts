import { expect, test } from "bun:test";
import { canDetachWithoutSsh } from "./takedown-policy";

test("allows disconnecting a site when its server rejects the Atlas SSH credential", () => {
  expect(
    canDetachWithoutSsh(
      new Error("root@169.58.139.32: Permission denied (publickey,password).")
    )
  ).toBe(true);
});
