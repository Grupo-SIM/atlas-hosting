import { describe, expect, test } from "bun:test";
import { parseChannelInput } from "./youtube";

const ID = "UCm-de8S3fpyO_7pxOPQOtOQ";

describe("parseChannelInput", () => {
  test("ID, @usuario e usuário sem @", () => {
    expect(parseChannelInput(ID)).toEqual({ id: ID, kind: "id" });
    expect(parseChannelInput("@kipperdev")).toEqual({
      kind: "page",
      path: "/@kipperdev",
    });
    expect(parseChannelInput("kipperdev")).toEqual({
      kind: "page",
      path: "/@kipperdev",
    });
  });

  test("links de canal", () => {
    expect(parseChannelInput(`https://www.youtube.com/channel/${ID}`)).toEqual({
      id: ID,
      kind: "id",
    });
    expect(
      parseChannelInput("https://www.youtube.com/@kipperdev/videos")
    ).toEqual({ kind: "page", path: "/@kipperdev" });
    expect(parseChannelInput("youtube.com/@kipperdev")).toEqual({
      kind: "page",
      path: "/@kipperdev",
    });
    expect(parseChannelInput("https://youtube.com/c/Nome")).toEqual({
      kind: "page",
      path: "/c/Nome",
    });
  });

  test("recusa vídeo, outro site e lixo", () => {
    for (const input of [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://evil.com/@kipperdev",
      "http://169.254.169.254/latest/meta-data",
      "@",
      "",
      "dois palavras",
    ])
      expect(parseChannelInput(input).kind).toBe("error");
  });
});
