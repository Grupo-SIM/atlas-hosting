/** Conversões entre hex e HSV (matiz 0–360, saturação e brilho 0–1) usadas pelo seletor de cor. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** `#rgb` ou `#rrggbb` (com ou sem `#`) → `#rrggbb` minúsculo; texto inválido → `undefined`. */
export function normalizeHex(input: string): string | undefined {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m?.[1]) return undefined;
  const h = m[1].toLowerCase();
  const full =
    h.length === 3
      ? h
          .split("")
          .map(c => c + c)
          .join("")
      : h;
  return `#${full}`;
}

export function hexToHsv(hex: string): Hsv {
  const n = normalizeHex(hex) ?? "#000000";
  const r = Number.parseInt(n.slice(1, 3), 16) / 255;
  const g = Number.parseInt(n.slice(3, 5), 16) / 255;
  const b = Number.parseInt(n.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 1);
  const vv = clamp(v, 0, 1);
  const c = vv * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = vv - c;
  const [r, g, b] =
    hh < 60
      ? [c, x, 0]
      : hh < 120
        ? [x, c, 0]
        : hh < 180
          ? [0, c, x]
          : hh < 240
            ? [0, x, c]
            : hh < 300
              ? [x, 0, c]
              : [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
