/**
 * Gera as miniaturas (WebP) da galeria de templates: `frontend/public/template-thumbs/<id>.webp` e o manifesto
 * `frontend/src/lib/site-builder/template-thumbs.json` (id → hash do que a miniatura mostra). A galeria usa a
 * imagem enquanto o hash do manifesto bater com o do template atual; se o template mudar e a imagem não for
 * refeita, ela volta sozinha à miniatura ao vivo (e o teste `template-thumbs.test.ts` avisa).
 *
 * Uso (na raiz, com rede: as fotos dos templates vêm de fora):
 *   bun scripts/template-thumbs.mjs            só o que está desatualizado ou faltando
 *   bun scripts/template-thumbs.mjs --all      todos
 *   bun scripts/template-thumbs.mjs margem sim-intermediacoes    só esses
 * Precisa do Google Chrome (CHROME_PATH muda o caminho) e do `sharp` (já está no node_modules).
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import sharp from "sharp";
import {
  listTemplates,
  peekTemplate,
  SiteRenderer,
  thumbnailHash,
  thumbnailSite,
} from "../packages/site-builder/src/index.ts";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = new URL("../frontend/public/template-thumbs/", import.meta.url)
  .pathname;
const MANIFEST = new URL(
  "../frontend/src/lib/site-builder/template-thumbs.json",
  import.meta.url
).pathname;
const WIDTH = 1280;
const HEIGHT = 960; // 4:3, o formato do cartão
const OUT_W = 640;
const OUT_H = 480;

const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.filter(a => !a.startsWith("--"));

mkdirSync(OUT, { recursive: true });
const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {};
const ids = listTemplates().map(t => t.id);
const todo = ids.filter(id => {
  if (only.length) return only.includes(id);
  if (all) return true;
  const site = peekTemplate(id)?.site;
  return (
    !site ||
    manifest[id]?.hash !== thumbnailHash(site) ||
    !existsSync(join(OUT, `${id}.webp`))
  );
});
console.log(`${todo.length} de ${ids.length} miniaturas para gerar`);

function chrome(file, png, profile) {
  return new Promise((resolve, reject) => {
    const p = spawn(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        `--window-size=${WIDTH},${HEIGHT}`,
        "--virtual-time-budget=20000",
        "--run-all-compositor-stages-before-draw",
        `--user-data-dir=${profile}`,
        `--screenshot=${png}`,
        `file://${file}`,
      ],
      { stdio: "ignore" }
    );
    const timer = setTimeout(() => {
      p.kill("SIGKILL");
      reject(new Error("Chrome demorou demais"));
    }, 90_000);
    p.on("exit", code => {
      clearTimeout(timer);
      code === 0 && existsSync(png)
        ? resolve()
        : reject(new Error(`Chrome saiu com ${code}`));
    });
  });
}

async function build(id, dir) {
  const site = peekTemplate(id)?.site;
  if (!site) throw new Error(`template ${id} não existe`);
  const { prelude } = await prerender(
    createElement(SiteRenderer, {
      path: "/",
      site: thumbnailSite(site),
      skipFxRuntime: true,
      thumbnail: true,
    })
  );
  const body = await new Response(prelude).text();
  const file = join(dir, `${id}.html`);
  writeFileSync(
    file,
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>html,body{margin:0}body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden}</style></head><body>${body}</body></html>`
  );
  const png = join(dir, `${id}.png`);
  await chrome(file, png, join(dir, `profile-${id}`));
  await sharp(png)
    .resize(OUT_W, OUT_H, { fit: "cover", position: "top" })
    .webp({ quality: 72 })
    .toFile(join(OUT, `${id}.webp`));
  manifest[id] = { h: OUT_H, hash: thumbnailHash(site), w: OUT_W };
}

const dir = mkdtempSync(join(tmpdir(), "template-thumbs-"));
const failed = [];
const queue = [...todo];
const workers = Array.from({ length: 3 }, async () => {
  for (let id = queue.shift(); id; id = queue.shift()) {
    try {
      await build(id, dir);
      console.log(`ok   ${id}`);
    } catch (error) {
      failed.push(id);
      console.error(`FALHA ${id}: ${error.message}`);
    }
  }
});
await Promise.all(workers);
rmSync(dir, { force: true, recursive: true });

// Template que saiu do código: a imagem e a entrada do manifesto saem junto.
for (const id of Object.keys(manifest)) {
  if (!ids.includes(id)) {
    delete manifest[id];
    rmSync(join(OUT, `${id}.webp`), { force: true });
  }
}
const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
if (failed.length) {
  console.error(`\n${failed.length} falharam: ${failed.join(", ")}`);
  process.exit(1);
}
