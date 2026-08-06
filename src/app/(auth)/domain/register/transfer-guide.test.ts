import { expect, test } from "bun:test";
import { transferGuide } from "./transfer-guide";

test("external-domain guide verifies with TXT and never instructs an A-record change", () => {
  expect(transferGuide.steps).toContain("Crie o registro TXT exibido pela Atlas no DNS atual");
  expect(transferGuide.steps.join(" ")).not.toContain("Registro A");
  expect(transferGuide.steps.join(" ")).not.toMatch(/\d{1,3}(?:\.\d{1,3}){3}/);
});
