import { describe, expect, test } from "bun:test";
import { resolveContaboImageId } from "./image-id";

describe("resolveContaboImageId", () => {
  test("mapeia as imagens fornecidas pela Contabo", () => {
    expect(resolveContaboImageId({ image: "ubuntu", ubuntuVersion: "Ubuntu 24.04" })).toBe("ubuntu.332");
    expect(resolveContaboImageId({ image: "ubuntu", ubuntuVersion: "Ubuntu 22.04" })).toBe("ubuntu.323");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2022" })).toBe("windows-server.308");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "Windows Server 2025" })).toBe("windows-server.335");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2019" })).toBe("windows-server.273");
    expect(resolveContaboImageId({ image: "windows", windowsVersion: "2016" })).toBe("windows-server.185");
    expect(resolveContaboImageId({ image: "plesk-linux", pleskLicence: "host" })).toBe("plesk-linux.323.1044");
    expect(resolveContaboImageId({ image: "debian", debianVersion: "Debian 13" })).toBe("debian.340");
    expect(resolveContaboImageId({ image: "debian", debianVersion: "Debian 12" })).toBe("debian.329");
    expect(resolveContaboImageId({ image: "almalinux", rhelVersion: "AlmaLinux 9" })).toBe("rhel-variants.325");
    expect(resolveContaboImageId({ image: "rockylinux", rhelVersion: "Rocky Linux 9" })).toBe("rhel-variants.326");
    expect(resolveContaboImageId({ image: "rhel", rhelVersion: "Rocky Linux 9" })).toBe("rhel-variants.326");
    expect(resolveContaboImageId({ image: "webmin", webminVersion: "AlmaLinux 9" })).toBe("webmin.325.639");
    expect(resolveContaboImageId({ image: "webmin-lamp", webminVersion: "Rocky Linux 9" })).toBe("wemin.326.1168");
  });
});
