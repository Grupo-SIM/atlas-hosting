import { expect, test } from "bun:test";
import { publishDomainCandidates } from "./publish-checkout-actions";

test("does not send unsupported Brazilian TLDs to the Namecheap publish lookup", () => {
  expect(publishDomainCandidates("tyzz")).toEqual([
    "tyzz.com",
    "tyzz.net",
    "tyzz.org",
    "tyzz.io",
    "tyzz.dev",
    "tyzz.app",
    "tyzz.site",
  ]);
});
