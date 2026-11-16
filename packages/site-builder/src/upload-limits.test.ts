import { describe, expect, test } from "bun:test";
import { adSizeOfKey, adSpec } from "./blocks/ads.js";
import {
  formatSize,
  UPLOAD_LIMIT_MB,
  uploadLimitBytes,
  uploadSizeError,
} from "./upload-limits.js";

describe("limites de upload", () => {
  test("dentro do limite não dá erro; acima dá, com os dois números", () => {
    expect(
      uploadSizeError({ size: uploadLimitBytes("image") }, "image")
    ).toBeNull();
    const msg = uploadSizeError({ size: 12.4 * 1024 * 1024 }, "image");
    expect(msg).toContain("12,4 MB");
    expect(msg).toContain(`${UPLOAD_LIMIT_MB.image} MB`);
  });

  test("vídeo e fonte têm limite próprio", () => {
    expect(uploadSizeError({ size: 20 * 1024 * 1024 }, "video")).toBeNull();
    expect(uploadSizeError({ size: 20 * 1024 * 1024 }, "image")).not.toBeNull();
    expect(uploadSizeError({ size: 4 * 1024 * 1024 }, "font")).not.toBeNull();
  });

  test("formatSize", () => {
    expect(formatSize(340 * 1024)).toBe("340 KB");
    expect(formatSize(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});

describe("adSpec", () => {
  const base = {};
  test("faixa larga: 970×150, e 728×90 nos temas compactos", () => {
    expect(adSpec("banner", base)).toMatchObject({ h: 150, w: 970 });
    expect(adSpec("banner", { variant: "holofote" })).toMatchObject({
      h: 90,
      w: 728,
    });
    expect(adSpec("banner", { variant: "zyrion" })).toMatchObject({
      h: 90,
      w: 728,
    });
  });

  test("coluna lateral muda com a quantidade de anúncios", () => {
    expect(adSpec("side", base, 1)).toMatchObject({ h: 600, w: 300 });
    expect(adSpec("side", base, 2)).toMatchObject({ h: 300, w: 300 });
    expect(adSpec("side", base, 3)).toMatchObject({ h: 250, w: 300 });
    expect(adSpec("side", base, 3).note).toContain("3 anúncios");
  });

  test("quadrado é 300×250 e o número do espaço define o formato", () => {
    expect(adSpec("square", base)).toMatchObject({ h: 250, w: 300 });
    expect(adSizeOfKey("banner")).toBe("banner");
    expect(adSizeOfKey("side2")).toBe("side");
  });
});
