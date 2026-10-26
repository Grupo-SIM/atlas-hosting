import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  assertValidDomain,
  buildDeployScript,
  buildRemoveScript,
  buildSiteBlock,
  CADDYFILE_BASE,
  WEB_ROOT,
} from "./caddy";

const base = {
  archive: "/tmp/atlas-site-1700000000.tgz",
  domain: "a.com",
  includeWww: true,
  releaseId: "1700000000",
};

describe("site-builder caddy", () => {
  test("aceita hostnames válidos e normaliza", () => {
    expect(assertValidDomain(" Meu-Site.COM.br ")).toBe("meu-site.com.br");
    expect(assertValidDomain("blog.sites.atlas.com.br")).toBe(
      "blog.sites.atlas.com.br"
    );
  });

  test("rejeita domínios que poderiam virar injeção de comando", () => {
    for (const bad of [
      "a.com; rm -rf /",
      "a.com$(id)",
      "../etc",
      "a b.com",
      "a.com\nb.com",
      "semponto",
      "-a.com",
      "'a.com",
    ]) {
      expect(() => assertValidDomain(bad)).toThrow();
    }
  });

  test("bloco do site: www só no domínio próprio, raiz em /srv/www/<dominio>", () => {
    const own = buildSiteBlock("a.com", true);
    expect(own).toContain("a.com, www.a.com {");
    expect(own).toContain(`root * ${WEB_ROOT}/a.com`);
    expect(own).toContain("# BEGIN atlas-site a.com");
    expect(own).toContain("# END atlas-site a.com");
    expect(buildSiteBlock("x.sites.com", false)).toContain("x.sites.com {");
    expect(buildSiteBlock("x.sites.com", false)).not.toContain("www.");
  });

  test("script só mexe em /srv/www/<dominio> e no Caddyfile.base, com lock e backup", () => {
    const script = buildDeployScript(base);
    expect(script).toContain(`"${WEB_ROOT}/a.com"`);
    expect(script).toContain(CADDYFILE_BASE);
    expect(script).toContain("flock 9");
    expect(script).toContain(`${CADDYFILE_BASE}.atlas-bak`);
    // A checagem de conflito acontece antes de trocar qualquer arquivo.
    expect(script.indexOf("já está configurado")).toBeLessThan(
      script.indexOf("tar -xzf")
    );
  });

  test("script recusa entradas perigosas", () => {
    expect(() => buildDeployScript({ ...base, releaseId: "1; id" })).toThrow();
    expect(() =>
      buildDeployScript({ ...base, archive: "/tmp/x; id" })
    ).toThrow();
    expect(() => buildDeployScript({ ...base, domain: "a.com;id" })).toThrow();
  });

  // Executa o trecho de Caddyfile do script de verdade (awk/grep) contra um arquivo temporário.
  test("redeploy substitui o bloco do site sem duplicar nem tocar no resto", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "caddy-test-"));
    const caddyfile = path.join(dir, "Caddyfile.base");
    writeFileSync(
      caddyfile,
      '{\n\temail ops@x.com\n}\n\nother.com {\n\trespond "ok"\n}\n'
    );

    const run = (includeWww: boolean) => {
      const script = buildDeployScript({ ...base, includeWww });
      // Só a parte do Caddyfile: sem tar/mv em /srv e com caminhos redirecionados ao diretório de teste.
      const caddyOnly = script
        .split("\n")
        .filter(
          l =>
            !(
              l.startsWith("mkdir -p") ||
              l.startsWith("rm -rf") ||
              l.startsWith("tar ") ||
              l.startsWith('rm -f "/tmp') ||
              l.startsWith("chmod") ||
              l.startsWith("[ ! -d") ||
              l.startsWith("mv ") ||
              l.startsWith("exec 9") ||
              l.startsWith("flock")
            )
        )
        .join("\n")
        .replaceAll(CADDYFILE_BASE, caddyfile);
      execFileSync("bash", ["-c", caddyOnly], { stdio: "pipe" });
    };

    run(true);
    run(false);
    const result = readFileSync(caddyfile, "utf8");

    expect(result.match(/# BEGIN atlas-site a\.com/g)?.length).toBe(1);
    expect(result).toContain("other.com {");
    expect(result).toContain("email ops@x.com");
    expect(result).toContain("a.com {");
    expect(result).not.toContain("www.a.com");
    expect(readFileSync(`${caddyfile}.atlas-bak`, "utf8")).toContain(
      "www.a.com"
    );
  });

  test("recusa domínio já configurado fora do Atlas", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "caddy-test-"));
    const caddyfile = path.join(dir, "Caddyfile.base");
    writeFileSync(caddyfile, 'a.com {\n\trespond "manual"\n}\n');
    const script = buildDeployScript(base)
      .split("\n")
      .filter(
        l => !/^(mkdir -p|rm -rf|tar |chmod|\[ ! -d|mv |exec 9|flock)/.test(l)
      )
      .join("\n")
      .replaceAll(CADDYFILE_BASE, caddyfile);
    expect(() =>
      execFileSync("bash", ["-c", script], { stdio: "pipe" })
    ).toThrow();
    expect(readFileSync(caddyfile, "utf8")).toBe(
      'a.com {\n\trespond "manual"\n}\n'
    );
  });
});

describe("buildRemoveScript", () => {
  test("remove só o bloco e a pasta do próprio domínio", () => {
    const script = buildRemoveScript({ domain: "a.sites.com" });
    expect(script).toContain('b="# BEGIN atlas-site a.sites.com"');
    expect(script).toContain('e="# END atlas-site a.sites.com"');
    expect(script).toContain('rm -rf "/srv/www/a.sites.com"');
    expect(script).toContain("flock 9");
  });

  test("respeita a pasta configurada e rejeita entradas perigosas", () => {
    expect(
      buildRemoveScript({ domain: "a.com", webRoot: "/opt/caddy/sites" })
    ).toContain('rm -rf "/opt/caddy/sites/a.com"');
    expect(() => buildRemoveScript({ domain: "a.com;rm -rf /" })).toThrow();
    expect(() =>
      buildRemoveScript({ domain: "a.com", webRoot: "/opt/../etc" })
    ).toThrow();
  });

  test("executa: tira só o bloco do domínio e mantém o resto do Caddyfile", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "caddy-rm-"));
    const caddyfile = path.join(dir, "Caddyfile.base");
    const webRoot = path.join(dir, "sites").replaceAll("\\", "/");
    writeFileSync(
      caddyfile,
      `(cloudflare) {\n\ttls {\n\t\tdns cloudflare x\n\t}\n}\n${buildSiteBlock("a.sites.com", false)}${buildSiteBlock("b.sites.com", false)}`
    );
    execFileSync("bash", [
      "-c",
      `mkdir -p "${webRoot}/a.sites.com" "${webRoot}/b.sites.com"`,
    ]);

    const script = buildRemoveScript({ domain: "a.sites.com" })
      .replaceAll(WEB_ROOT, webRoot)
      .split("\n")
      .filter(l => !/^\s*(exec 9|flock)/.test(l))
      .join("\n")
      .replaceAll(CADDYFILE_BASE, caddyfile);
    execFileSync("bash", ["-c", script], { stdio: "pipe" });
    execFileSync("bash", ["-c", script], { stdio: "pipe" });

    const result = readFileSync(caddyfile, "utf8");
    expect(result).not.toContain("a.sites.com");
    expect(result).toContain("b.sites.com {");
    expect(result).toContain("(cloudflare)");
    expect(
      execFileSync("bash", ["-c", `ls "${webRoot}"`])
        .toString()
        .trim()
    ).toBe("b.sites.com");
  });
});
