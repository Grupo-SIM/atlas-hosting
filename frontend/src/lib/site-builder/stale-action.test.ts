import { describe, expect, test } from "bun:test";
import {
  friendlyError,
  isStaleActionError,
  STALE_ACTION_MESSAGE,
  staleActionMessage,
} from "./stale-action";

describe("isStaleActionError", () => {
  test("reconhece o erro do Next de ação que não existe mais", () => {
    const e = new Error(
      'Server Action "40a746631916b9b5fb0fbdb2367e520f0aaaca24e6" was not found on the server. Read more: https://nextjs.org/docs/messages/failed-to-find-server-action'
    );
    expect(isStaleActionError(e)).toBe(true);
    expect(staleActionMessage(e)).toBe(STALE_ACTION_MESSAGE);
  });

  test("reconhece a variante 'Failed to find Server Action'", () => {
    expect(
      isStaleActionError(new Error("Failed to find Server Action 'abc'."))
    ).toBe(true);
  });

  test("outros erros não são tratados como página desatualizada", () => {
    expect(isStaleActionError(new Error("Arquivo muito grande"))).toBe(false);
    expect(isStaleActionError(null)).toBe(false);
    expect(staleActionMessage(new Error("x"))).toBe(null);
  });
});

describe("friendlyError", () => {
  test("página desatualizada, erro técnico e erro comum", () => {
    expect(
      friendlyError(new Error('Server Action "x" was not found on the server.'))
    ).toBe(STALE_ACTION_MESSAGE);
    expect(
      friendlyError(
        new Error("An error occurred in the Server Components render.")
      )
    ).toBe("Não foi possível concluir. Tente de novo.");
    expect(friendlyError(new Error("Site não encontrado."))).toBe(
      "Site não encontrado."
    );
    expect(friendlyError("x", "padrão")).toBe("padrão");
  });
});
