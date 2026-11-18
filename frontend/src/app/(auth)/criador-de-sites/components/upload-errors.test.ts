import { describe, expect, test } from "bun:test";
import { uploadFailureMessage } from "./upload-errors";

describe("uploadFailureMessage", () => {
  test("erro técnico genérico do servidor vira uma mensagem clara com o limite", () => {
    const technical = new Error(
      "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details."
    );
    expect(uploadFailureMessage(technical, "video")).toBe(
      "Não foi possível enviar o vídeo. Confira se ele tem no máximo 25 MB e tente de novo."
    );
    expect(uploadFailureMessage(technical, "image")).toContain("8 MB");
    expect(
      uploadFailureMessage(new Error("Failed to fetch"), "video")
    ).toContain("25 MB");
    expect(uploadFailureMessage(undefined, "image")).toContain("a imagem");
  });

  test("mensagem que o servidor já escreveu para a pessoa é mantida", () => {
    expect(
      uploadFailureMessage(new Error("Use um vídeo MP4 ou WebM."), "video")
    ).toBe("Use um vídeo MP4 ou WebM.");
  });
});
