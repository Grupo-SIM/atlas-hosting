import { describe, expect, test } from "bun:test";
import { describeError, explainDeployError, redact } from "./publishLog";

describe("redact", () => {
  test("mascara a senha em qualquer ponto do texto", () => {
    expect(redact("ssh falhou com s3nh@ e s3nh@", ["s3nh@"])).toBe(
      "ssh falhou com *** e ***"
    );
  });

  test("ignora segredo vazio ou ausente", () => {
    expect(redact("texto", [undefined, ""])).toBe("texto");
  });
});

describe("describeError", () => {
  test("nunca devolve a senha, nem na pilha", () => {
    const error = new Error("Permission denied (password: hunter2)");
    const text = describeError(error, ["hunter2"]);
    expect(text).not.toContain("hunter2");
    expect(text).toContain("***");
  });

  test("inclui o código do erro do sistema", () => {
    const error = Object.assign(new Error("spawn sshpass ENOENT"), {
      code: "ENOENT",
    });
    expect(describeError(error)).toContain("[ENOENT]");
  });
});

describe("explainDeployError", () => {
  test("senha errada", () => {
    expect(
      explainDeployError(new Error("root@1.2.3.4: Permission denied"))
    ).toContain("autenticação");
  });

  test("porta 22 fechada", () => {
    expect(
      explainDeployError(new Error("ssh: connect: Connection refused"))
    ).toContain("porta 22");
  });

  test("timeout", () => {
    expect(
      explainDeployError(new Error("Connection timed out during banner"))
    ).toContain("não respondeu");
  });

  test("binário ausente no container", () => {
    const error = Object.assign(new Error("spawn sshpass ENOENT"), {
      code: "ENOENT",
    });
    expect(explainDeployError(error)).toContain("binário");
  });

  test("erro desconhecido não inventa dica", () => {
    expect(explainDeployError(new Error("algo inesperado"))).toBeUndefined();
  });
});
