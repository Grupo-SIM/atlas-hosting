import { describe, expect, test } from "bun:test";
import { resolveContaboImageId } from "./image-id";

describe("resolveContaboImageId", () => {
  test("mapeia as imagens fornecidas pela Contabo", () => {
    expect(resolveContaboImageId({ image: "ubuntu", ubuntuVersion: "Ubuntu 24.04" })).toBe("d64d5c6c-9dda-4e38-8174-0ee282474d8a");
    expect(resolveContaboImageId({ image: "ubuntu", ubuntuVersion: "Ubuntu 22.04" })).toBe("afecbb85-e2fc-46f0-9684-b46b1faf00bb");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2022" })).toBe("3b4102d0-f259-4496-bb4f-66173a8a61a5");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "Windows Server 2025" })).toBe("ef27e2fa-188f-4767-964b-7543fea74968");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2019" })).toBe("511200d3-7924-4443-8ad9-a041870d513e");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2016" })).toBe("3e4341e1-b415-4ca1-bdbd-4b560c96107b");
    expect(resolveContaboImageId({ image: "plesk-linux", pleskLicence: "host" })).toBe("ab0751ce-49ff-4fd0-b919-2479b7c71fdb");
    expect(resolveContaboImageId({ image: "debian", debianVersion: "Debian 13" })).toBe("0a3f4b06-a104-4917-bc85-11eba40cb6de");
    expect(resolveContaboImageId({ image: "debian", debianVersion: "Debian 12" })).toBe("4efbc0ba-2313-4fe1-842a-516f8652e729");
    expect(resolveContaboImageId({ image: "almalinux", rhelVersion: "AlmaLinux 9" })).toBe("81d9280e-8753-40ae-8aef-7f6e20751b85");
    expect(resolveContaboImageId({ image: "rockylinux", rhelVersion: "Rocky Linux 9" })).toBe("fe6c2c36-031e-4474-aa5c-c5297196c80e");
    expect(resolveContaboImageId({ image: "rhel", rhelVersion: "Rocky Linux 9" })).toBe("fe6c2c36-031e-4474-aa5c-c5297196c80e");
    expect(resolveContaboImageId({ image: "webmin", webminVersion: "AlmaLinux 9" })).toBe("81d9280e-8753-40ae-8aef-7f6e20751b85");
    expect(resolveContaboImageId({ image: "webmin-lamp", webminVersion: "Rocky Linux 9" })).toBe("fe6c2c36-031e-4474-aa5c-c5297196c80e");
  });
});
