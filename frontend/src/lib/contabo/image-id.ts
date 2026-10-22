import type { AtlasVpsConfiguration } from "./provisioning";

const IMAGE_IDS: Record<string, string> = {
  "almalinux:9": "81d9280e-8753-40ae-8aef-7f6e20751b85",
  "debian:12": "4efbc0ba-2313-4fe1-842a-516f8652e729",
  "debian:13": "0a3f4b06-a104-4917-bc85-11eba40cb6de",
  "plesk-linux:admin": "ab0751ce-49ff-4fd0-b919-2479b7c71fdb",
  "plesk-linux:host": "ab0751ce-49ff-4fd0-b919-2479b7c71fdb",
  "plesk-linux:pro": "ab0751ce-49ff-4fd0-b919-2479b7c71fdb",
  "rockylinux:9": "fe6c2c36-031e-4474-aa5c-c5297196c80e",
  "ubuntu:22.04": "afecbb85-e2fc-46f0-9684-b46b1faf00bb",
  "ubuntu:24.04": "d64d5c6c-9dda-4e38-8174-0ee282474d8a",
  "webmin-lamp:almalinux": "81d9280e-8753-40ae-8aef-7f6e20751b85",
  "webmin-lamp:rockylinux": "fe6c2c36-031e-4474-aa5c-c5297196c80e",
  "webmin-lamp:ubuntu": "afecbb85-e2fc-46f0-9684-b46b1faf00bb",
  "webmin:almalinux": "81d9280e-8753-40ae-8aef-7f6e20751b85",
  "webmin:rockylinux": "fe6c2c36-031e-4474-aa5c-c5297196c80e",
  "webmin:ubuntu": "afecbb85-e2fc-46f0-9684-b46b1faf00bb",
  "windows:2016": "3e4341e1-b415-4ca1-bdbd-4b560c96107b",
  "windows:2019": "511200d3-7924-4443-8ad9-a041870d513e",
  "windows:2022": "3b4102d0-f259-4496-bb4f-66173a8a61a5",
  "windows:2025": "ef27e2fa-188f-4767-964b-7543fea74968",
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
