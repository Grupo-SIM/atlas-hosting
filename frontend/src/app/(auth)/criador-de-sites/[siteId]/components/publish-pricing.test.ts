import { expect, test } from "bun:test";
import { atlasHostingPrice } from "./publish-pricing";

test("does not charge Atlas VM hosting to an exempt editor account", () => {
  expect(
    atlasHostingPrice({
      atlasVmMonthlyBrl: 1,
      complimentaryAtlasHosting: true,
      hostingPaid: false,
      target: "atlas_vm",
    })
  ).toBeNull();
});

test("keeps the Atlas VM monthly price for a regular editor account", () => {
  expect(
    atlasHostingPrice({
      atlasVmMonthlyBrl: 1,
      complimentaryAtlasHosting: false,
      hostingPaid: false,
      target: "atlas_vm",
    })
  ).toBe(1);
});
