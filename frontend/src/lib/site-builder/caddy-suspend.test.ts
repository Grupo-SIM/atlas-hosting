import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  buildSiteBlock,
  buildSuspendScript,
  CADDYFILE_BASE,
  SUSPENDED_DIR_NAME,
  WEB_ROOT,
} from "./caddy";

const MANUAL_BLOCK = ["a.com {", '\trespond "manual"', "}", ""].join("\n");

/**
 * `flock` não existe no bash do WSL usado nos testes, e `assertValidRoot`
 * (com razão) recusa caminho do Windows: o script é gerado com a pasta padrão e
 * ela é trocada aqui pela temporária, como nos outros testes do Caddy.
 */
const toWslPath = (windowsPath: string) =>
  windowsPath
    .replace(
      /^([a-z]):[\\/]/i,
      (_match, drive: string) => `/mnt/${drive.toLowerCase()}/`
    )
    .replaceAll("\\", "/");

const runnable = (script: string, caddyfile: string, webRoot: string) =>
  script
    .replaceAll(WEB_ROOT, webRoot)
    .split("\n")
    .filter(line => !/^\s*(exec 9|flock)/.test(line))
    .join("\n")
    .replaceAll(CADDYFILE_BASE, toWslPath(caddyfile));

describe("buildSuspendScript", () => {
  test("troca o root pelo da página de suspensão, sem apagar o site", () => {
    const script = buildSuspendScript({
      domain: "a.sites.com",
      includeWww: false,
    });
    expect(script).toContain(`/srv/www/${SUSPENDED_DIR_NAME}`);
    expect(script).toContain('b="# BEGIN atlas-site a.sites.com"');
    expect(script).toContain("flock 9");
    // Suspender nunca remove os arquivos do site.
    expect(script).not.toContain('rm -rf "/srv/www/a.sites.com"');
  });

  test("rejeita entradas perigosas", () => {
    expect(() =>
      buildSuspendScript({ domain: "a.com;rm -rf /", includeWww: false })
    ).toThrow();
    expect(() =>
      buildSuspendScript({
        domain: "a.com",
        includeWww: false,
        webRoot: "/opt/../etc",
      })
    ).toThrow();
  });

  test("executa: suspende um site e deixa os outros blocos intactos", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "caddy-susp-"));
    const caddyfile = path.join(dir, "Caddyfile.base");
    const nodeWebRoot = path.join(dir, "sites");
    const webRoot = toWslPath(nodeWebRoot);
    writeFileSync(
      caddyfile,
      `(cloudflare) {\n\ttls {\n\t\tdns cloudflare x\n\t}\n}\n${buildSiteBlock(
        "a.sites.com",
        false
      )}${buildSiteBlock("b.sites.com", false)}`
    );
    execFileSync("bash", [
      "-c",
      `mkdir -p "${webRoot}/a.sites.com" && echo meusite > "${webRoot}/a.sites.com/index.html"`,
    ]);

    const script = runnable(
      buildSuspendScript({ domain: "a.sites.com", includeWww: false }),
      caddyfile,
      webRoot
    );
    const scriptPath = path.join(dir, "suspend.sh");
    writeFileSync(scriptPath, script);
    // Repetir é seguro.
    execFileSync("bash", [toWslPath(scriptPath)], { stdio: "pipe" });
    execFileSync("bash", [toWslPath(scriptPath)], { stdio: "pipe" });

    const result = readFileSync(caddyfile, "utf8");
    expect(result.match(/# BEGIN atlas-site a\.sites\.com/g)?.length).toBe(1);
    expect(result).toContain(`root * ${webRoot}/${SUSPENDED_DIR_NAME}`);
    expect(result).not.toContain("root * /srv/www/a.sites.com");
    // O bloco do vizinho não é tocado.
    expect(result).toContain(`root * ${WEB_ROOT}/b.sites.com`);
    expect(result).toContain("(cloudflare)");
    // A página de suspensão existe e o conteúdo do site continua no lugar.
    expect(
      readFileSync(
        path.join(nodeWebRoot, SUSPENDED_DIR_NAME, "index.html"),
        "utf8"
      )
    ).toContain("indisponível");
    expect(
      readFileSync(
        path.join(nodeWebRoot, "a.sites.com", "index.html"),
        "utf8"
      ).trim()
    ).toBe("meusite");
  });

  test("recusa domínio configurado fora do Atlas", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "caddy-susp-conflict-"));
    const caddyfile = path.join(dir, "Caddyfile.base");
    const webRoot = toWslPath(path.join(dir, "sites"));
    writeFileSync(caddyfile, MANUAL_BLOCK);

    const script = runnable(
      buildSuspendScript({ domain: "a.com", includeWww: false }),
      caddyfile,
      webRoot
    );
    expect(() =>
      execFileSync("bash", ["-c", script], { stdio: "pipe" })
    ).toThrow();
    expect(readFileSync(caddyfile, "utf8")).toBe(MANUAL_BLOCK);
  });
});
