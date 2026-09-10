import { describe, expect, test } from "bun:test";
import type { CloudflareZone } from "@/lib/server/apis/cloudflare";
import {
  reconcileCloudflareActivation,
  type CloudflareActivationStatePatch,
} from "./reconcile-cloudflare-activation";

const candidate = {
  domain: "example.com",
  id: "domain-1",
  zoneId: "zone-1",
};

const zone: CloudflareZone = {
  id: "zone-1",
  name: "example.com",
  name_servers: ["amy.ns.cloudflare.com", "brad.ns.cloudflare.com"],
  status: "pending",
  type: "full",
};

function dependencies(options?: {
  activationError?: Error;
  getZoneError?: Error;
  zone?: CloudflareZone;
}) {
  const patches: CloudflareActivationStatePatch[] = [];
  let activationChecks = 0;
  return {
    async getZone() {
      if (options?.getZoneError) throw options.getZoneError;
      return options?.zone || zone;
    },
    get activationChecks() {
      return activationChecks;
    },
    patches,
    async triggerActivationCheck() {
      activationChecks += 1;
      if (options?.activationError) throw options.activationError;
    },
    async updateDomain(_id: string, patch: CloudflareActivationStatePatch) {
      patches.push(patch);
    },
  };
}

describe("reconcileCloudflareActivation", () => {
  test("marks an active Cloudflare zone connected", async () => {
    const fake = dependencies({ zone: { ...zone, status: "active" } });

    const result = await reconcileCloudflareActivation(candidate, fake);

    expect(result).toEqual({ domain: "example.com", status: "connected" });
    expect(fake.activationChecks).toBe(0);
    expect(fake.patches).toHaveLength(1);
    expect(fake.patches[0]).toMatchObject({
      cloudflareZoneStatus: "active",
      connectionStatus: "connected",
      lastDnsError: null,
    });
  });

  test("requests an activation check for a pending zone", async () => {
    const fake = dependencies();

    const result = await reconcileCloudflareActivation(candidate, fake);

    expect(result).toEqual({
      domain: "example.com",
      status: "awaiting_activation",
    });
    expect(fake.activationChecks).toBe(1);
    expect(fake.patches[0]).toMatchObject({
      cloudflareZoneStatus: "pending",
      connectionStatus: "awaiting_activation",
      lastDnsError: null,
    });
  });

  test("records a Cloudflare lookup failure without marking the domain inactive", async () => {
    const fake = dependencies({ getZoneError: new Error("Cloudflare unavailable") });

    const result = await reconcileCloudflareActivation(candidate, fake);

    expect(result).toEqual({ domain: "example.com", status: "error" });
    expect(fake.patches[0]).toMatchObject({
      cloudflareZoneStatus: "pending",
      connectionStatus: "awaiting_activation",
      lastDnsError: "serviço de DNS do Atlas unavailable",
    });
  });
});
