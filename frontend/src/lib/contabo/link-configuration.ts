import { randomBytes } from "node:crypto";
import type { AtlasVpsConfiguration } from "./provisioning";

/** Direct payment links skip the server configurator; fill missing provisioning fields. */
export function completeProvisioningConfiguration(config: AtlasVpsConfiguration, planType: string): AtlasVpsConfiguration & { password: string } {
  return {
    ...config,
    image: config.image || (planType === "vps-windows" ? "windows" : "ubuntu"),
    location: config.location || "eu",
    password: typeof config.password === "string" && config.password.length >= 8
      ? config.password
      : `Aa1!${randomBytes(18).toString("base64url")}`,
  };
}
