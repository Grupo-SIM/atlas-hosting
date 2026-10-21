import { afterEach, describe, expect, test } from "bun:test";
import simpayApi, { isApprovedPaymentStatus } from "./index";

describe("Simpay approved payment statuses", () => {
  test("normalizes approved statuses returned by Simpay and DOM", () => {
    for (const status of [
      "completed",
      "PAID",
      "Approved",
      "confirmed",
      "authorized",
      "captured",
      "succeeded",
      "success",
      "charge-approved",
    ]) {
      expect(isApprovedPaymentStatus(status)).toBe(true);
    }
  });

  test("does not approve pending or failed statuses", () => {
    expect(isApprovedPaymentStatus("pending")).toBe(false);
    expect(isApprovedPaymentStatus("failed")).toBe(false);
    expect(isApprovedPaymentStatus(undefined)).toBe(false);
  });
});

const originalFetch = globalThis.fetch;
const originalAtlasUrl = process.env.ATLAS_SIMPAY_API_URL;
const originalUrl = process.env.SIMPAY_API_URL;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalAtlasUrl === undefined) delete process.env.ATLAS_SIMPAY_API_URL;
  else process.env.ATLAS_SIMPAY_API_URL = originalAtlasUrl;
  if (originalUrl === undefined) delete process.env.SIMPAY_API_URL;
  else process.env.SIMPAY_API_URL = originalUrl;
});

test("direct PIX lookup uses the same Atlas override as payment creation", async () => {
  process.env.ATLAS_SIMPAY_API_URL = "https://atlas-gateway.example/";
  process.env.SIMPAY_API_URL = "https://other-gateway.example";
  let requestedUrl = "";
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestedUrl = String(url);
    return Response.json({ status: "PAID" });
  }) as typeof fetch;
  expect(await simpayApi.getPixPaymentStatus("payment/id")).toEqual({ status: "PAID" });
  expect(requestedUrl).toBe("https://atlas-gateway.example/atlas/payments/pix-status/payment%2Fid");
});

test("direct PIX lookup rejects gateway errors", async () => {
  globalThis.fetch = (async () => new Response("unavailable", { status: 503 })) as typeof fetch;
  await expect(simpayApi.getPixPaymentStatus("payment")).rejects.toThrow("HTTP 503");
});
