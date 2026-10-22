import { expect, test } from "bun:test";
import { completeProvisioningConfiguration } from "./link-configuration";

test("direct links fill password and correct operating system without altering contract", () => {
  const linux = completeProvisioningConfiguration({ duration: "7" }, "vps");
  expect(linux).toMatchObject({ image: "ubuntu", location: "eu", duration: "7" });
  expect(linux.password).toMatch(/^Aa1![A-Za-z0-9_-]{24}$/);
  expect(completeProvisioningConfiguration({}, "vps-windows").image).toBe("windows");
});
test("persisted password and explicit configuration survive retries", () => {
  const config = { password: "Simulated-valid-8!", image: "debian", location: "us-east", duration: "12" };
  expect(completeProvisioningConfiguration(config, "vps")).toEqual(config);
  expect(config).toEqual({ password: "Simulated-valid-8!", image: "debian", location: "us-east", duration: "12" });
});
