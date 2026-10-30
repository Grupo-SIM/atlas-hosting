import { describe, expect, test } from "bun:test";
import {
  isYouTubeChannelId,
  latestVideoEmbed,
  parseYouTubeVideoId,
  videoEmbed,
} from "./youtube.js";

const CHANNEL = "UCm-de8S3fpyO_7pxOPQOtOQ";

describe("parseYouTubeVideoId", () => {
  test("aceita ID puro e os formatos de link", () => {
    for (const input of [
      "dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
      "youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ?si=abc",
      "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://www.youtube.com/live/dQw4w9WgXcQ",
    ])
      expect(parseYouTubeVideoId(input)).toBe("dQw4w9WgXcQ");
  });

  test("recusa outros hosts, lixo e tentativa de injeção", () => {
    for (const input of [
      "",
      "https://evil.com/watch?v=dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=curto",
      'dQw4w9WgXcQ"onload="x',
      "javascript:alert(1)",
    ])
      expect(parseYouTubeVideoId(input)).toBeNull();
  });
});

describe("embeds", () => {
  test("último vídeo usa a playlist de uploads do canal", () => {
    expect(isYouTubeChannelId(CHANNEL)).toBe(true);
    expect(latestVideoEmbed(CHANNEL)).toBe(
      "https://www.youtube-nocookie.com/embed/videoseries?list=UUm-de8S3fpyO_7pxOPQOtOQ"
    );
  });

  test("ID de canal inválido não gera embed", () => {
    expect(latestVideoEmbed("UCcurto")).toBeNull();
    expect(latestVideoEmbed(`${CHANNEL}"><script>`)).toBeNull();
  });

  test("vídeo específico", () => {
    expect(videoEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(videoEmbed("nada")).toBeNull();
  });
});
