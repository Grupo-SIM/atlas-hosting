import { describe, expect, test } from "bun:test";
import { CloudflareApi } from ".";

function json(result: unknown, resultInfo?: Record<string, number>) {
  return new Response(
    JSON.stringify({
      errors: [],
      messages: [],
      result,
      result_info: resultInfo,
      success: true,
    }),
    { headers: { "content-type": "application/json" }, status: 200 }
  );
}

describe("CloudflareApi", () => {
  test("reuses an existing exact zone", async () => {
    const calls: string[] = [];
    const api = new CloudflareApi("token", async url => {
      calls.push(String(url));
      return json([
        {
          id: "zone-1",
          name: "example.com",
          name_servers: ["a.ns.cloudflare.com", "b.ns.cloudflare.com"],
          status: "pending",
          type: "full",
        },
      ]);
    });

    expect((await api.ensureZone("example.com")).id).toBe("zone-1");
    expect(calls).toHaveLength(1);
  });

  test("paginates DNS records", async () => {
    let page = 0;
    const api = new CloudflareApi("token", async () => {
      page += 1;
      return json(
        [
          {
            content: "192.0.2.1",
            id: String(page),
            name: "example.com",
            ttl: 1,
            type: "A",
          },
        ],
        { total_pages: 2 }
      );
    });

    expect(
      (await api.listDnsRecords("zone-1")).map(record => record.id)
    ).toEqual(["1", "2"]);
  });

  test("paginates scanned DNS records", async () => {
    let page = 0;
    const api = new CloudflareApi("token", async url => {
      page += 1;
      expect(String(url)).toContain(
        `dns_records/scan/review?page=${page}&per_page=100`
      );
      return json(
        [
          {
            content: `192.0.2.${page}`,
            id: String(page),
            name: "example.com",
            ttl: 1,
            type: "A",
          },
        ],
        { total_pages: 2 }
      );
    });

    expect(
      (await api.listScannedRecords("zone-1")).map(record => record.id)
    ).toEqual(["1", "2"]);
  });

  test("normalizes Cloudflare API errors", async () => {
    const api = new CloudflareApi(
      "token",
      async () =>
        new Response(
          JSON.stringify({
            errors: [{ code: 9109, message: "Invalid access token" }],
            messages: [],
            result: null,
            success: false,
          }),
          { headers: { "content-type": "application/json" }, status: 403 }
        )
    );

    await expect(api.verifyToken()).rejects.toEqual(
      expect.objectContaining({
        codes: [9109],
        message: "Invalid access token",
        status: 403,
      })
    );
  });

  test("rejects zone files larger than Cloudflare limit", async () => {
    const api = new CloudflareApi("token");
    const file = new File([new Uint8Array(256 * 1024 + 1)], "zone.txt");
    await expect(api.importZoneFile("zone-1", file)).rejects.toThrow(
      "no máximo 256 KiB"
    );
  });
});

 describe("Cloudflare zone deletion", () => {
  test("deletes the zone and accepts an already absent zone", async () => {
    for (const status of [200, 404]) {
      const api = new CloudflareApi("token", async (url, init) => {
        expect(String(url)).toEndWith("/zones/zone-1");
        expect(init?.method).toBe("DELETE");
        return new Response(JSON.stringify({ success: status === 200, result: { id: "zone-1" }, errors: [] }), { status, headers: { "content-type": "application/json" } });
      });
      await expect(api.deleteZone("zone-1")).resolves.toBeUndefined();
    }
  });

  test("does not hide authorization or provider failure", async () => {
    for (const status of [403, 500]) {
      const api = new CloudflareApi("token", async () => new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: "failed" }] }), { status, headers: { "content-type": "application/json" } }));
      await expect(api.deleteZone("zone-1")).rejects.toThrow("failed");
    }
  });
});
