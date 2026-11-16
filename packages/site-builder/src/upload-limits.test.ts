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

describe("nomes dos anúncios", () => {
  test("o topo e a lateral direita têm nomes que não se confundem (sem numeração corrida)", async () => {
    const { AD_KEYS, AD_NAMES, AD_TITLES, SIDE_COUNT_OPTIONS } = await import(
      "./blocks/ads.js"
    );
    expect(AD_NAMES.banner).toContain("Topo");
    for (const k of ["side", "side2", "side3"] as const) {
      expect(AD_NAMES[k]).toContain("Lateral direita");
    }
    // Ninguém mais lê "Espaço 1/2/3/4": o 1 (topo) e o 2 (lateral) pareciam vizinhos.
    const texts = [
      ...AD_KEYS.map(k => AD_NAMES[k]),
      ...AD_KEYS.map(k => AD_TITLES[k]),
      ...SIDE_COUNT_OPTIONS.map(o => o.label),
    ];
    for (const t of texts)
      expect(t).not.toMatch(/Espaços? (publicitários? )?\d/);
    expect(SIDE_COUNT_OPTIONS.map(o => o.label)).toEqual([
      "1 anúncio na lateral direita",
      "2 anúncios na lateral direita",
      "3 anúncios na lateral direita",
    ]);
  });
});
