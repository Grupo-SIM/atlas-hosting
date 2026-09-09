import { describe, expect, test } from "bun:test";
import { buildContaboInstanceRequest } from "./provisioning";

describe("buildContaboInstanceRequest", () => {
  test("mapeia Cloud VPS Plus, região e complementos para Contabo", () => {
    expect(
      buildContaboInstanceRequest({
        config: {
          backup: "true",
          image: "plesk",
          ipv4Address: "2ip",
          location: "au-sydney",
          pleskLicence: "host",
          privateNetwork: "enabled",
          storage: "4-storage-upgrade",
        },
        displayName: "  Cliente Atlas  ",
        imageId: "image-uuid",
        planId: "4",
        planType: "vps",
        rootPasswordSecretId: 42,
      })
    ).toEqual({
      addOns: {
        additionalIps: {},
        backup: {},
        privateNetworking: {},
      },
      defaultUser: "root",
      displayName: "Cliente Atlas",
      imageId: "image-uuid",
      license: "PleskHost",
      period: 1,
      productId: "V159",
      region: "AUS",
      rootPassword: 42,
    });
  });

  test("mapeia VDS e licença cPanel", () => {
    expect(
      buildContaboInstanceRequest({
        config: {
          cpanelLicence: "100",
          duration: "24",
          image: "cpanel",
          location: "us-east",
        },
        displayName: "VDS cliente",
        imageId: "image-uuid",
        planId: "xl",
        planType: "vds",
      })
    ).toMatchObject({
      license: "cPanel100",
      period: 24,
      productId: "V11",
      region: "US-east",
    });
  });

  test("mapeia Storage VPS para o produto Contabo correspondente", () => {
    expect(() =>
      buildContaboInstanceRequest({
        config: {},
        displayName: "Storage",
        imageId: "image-uuid",
        planId: "10",
        planType: "storage-vps",
      })
    ).not.toThrow();

    expect(
      buildContaboInstanceRequest({
        config: {},
        displayName: "Storage",
        imageId: "image-uuid",
        planId: "50",
        planType: "storage-vps",
      })
    ).toMatchObject({ productId: "V105" });
  });

  test("recusa opções sem equivalente no payload de instância", () => {

    expect(() =>
      buildContaboInstanceRequest({
        config: { objectStorage: "1tb" },
        displayName: "Cloud",
        imageId: "image-uuid",
        planId: "4",
        planType: "vps",
      })
    ).toThrow("Object Storage");
  });
});
