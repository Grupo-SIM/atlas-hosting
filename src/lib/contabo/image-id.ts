import type { AtlasVpsConfiguration } from "./provisioning";

const IMAGE_IDS: Record<string, string> = {
  "almalinux:9": "rhel-variants.325",
  "debian:12": "debian.329",
  "debian:13": "debian.340",
  "plesk-linux:admin": "plesk-linux.323.1047",
  "plesk-linux:host": "plesk-linux.323.1044",
  "plesk-linux:pro": "plesk-linux.323.1045",
  "rockylinux:9": "rhel-variants.326",
  "ubuntu:22.04": "ubuntu.323",
  "ubuntu:24.04": "ubuntu.332",
  "webmin-lamp:almalinux": "webmin.325.1168",
  "webmin-lamp:rockylinux": "wemin.326.1168",
  "webmin-lamp:ubuntu": "webmin.323.1168",
  "webmin:almalinux": "webmin.325.639",
  "webmin:rockylinux": "wemin.326.639",
  "webmin:ubuntu": "webmin.323.639",
  "windows:2016": "windows-server.185",
  "windows:2019": "windows-server.273",
  "windows:2022": "windows-server.308",
  "windows:2025": "windows-server.335",
};

function version(value: string | undefined, fallback: string): string {
  return value?.match(/\d{4}|\d{2}(?:\.\d+)?/)?.[0] ?? fallback;
}

export function resolveContaboImageId(config: AtlasVpsConfiguration): string {
  const image = config.image || "ubuntu";
  if (image === "plesk" || image === "plesk-linux") {
    const id = IMAGE_IDS[`plesk-linux:${config.pleskLicence || "admin"}`];
    if (id) return id;
  }
  if (image === "windows") return IMAGE_IDS[`windows:${version(config.windowsVersion, "2025")}`]!;
  if (image === "ubuntu") return IMAGE_IDS[`ubuntu:${version(config.ubuntuVersion, "24.04")}`]!;
  if (image === "debian") return IMAGE_IDS[`debian:${version(config.debianVersion, "13")}`]!;
  if (image === "almalinux" || image === "rockylinux") return IMAGE_IDS[`${image}:${version(config.rhelVersion, "9")}`]!;
  if (image === "rhel") {
    const selected = config.rhelVersion?.toLowerCase().includes("rocky")
      ? "rockylinux"
      : "almalinux";
    return IMAGE_IDS[`${selected}:${version(config.rhelVersion, "9")}`]!;
  }
  if (image === "webmin" || image === "webmin-lamp") {
    const variant = config.webminVersion?.toLowerCase().includes("alma") ? "almalinux" : config.webminVersion?.toLowerCase().includes("rocky") ? "rockylinux" : "ubuntu";
    return IMAGE_IDS[`${image}:${variant}`]!;
  }
  throw new Error(`Imagem não suportada para provisionamento Contabo: ${image}.`);
}
