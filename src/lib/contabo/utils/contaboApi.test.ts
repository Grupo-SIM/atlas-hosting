import { afterEach, expect, spyOn, test } from "bun:test";
import { getContaboApi } from "./contaboApi";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test("supplier inventory uses server authentication and unique request IDs", async () => {
  const requests: Request[] = [];
  spyOn(globalThis, "fetch").mockImplementation(async (input, options) => {
    const request = new Request(input, options);
    requests.push(request);
    if (request.url.includes("openid-connect/token")) return Response.json({ access_token: "simulated-token", token_type: "Bearer" });
    return Response.json({ data: [], _pagination: { totalPages: 1 } });
  });
  const first = await getContaboApi();
  await first.get("compute/instances").json();
  const second = await getContaboApi();
  await second.get("compute/instances").json();
  expect(requests).toHaveLength(3);
  expect(requests[1]!.url).toBe("https://api.contabo.com/v1/compute/instances");
  expect(requests[1]!.headers.get("authorization")).toBe("Bearer simulated-token");
  expect(requests[1]!.headers.get("x-request-id")).toBeTruthy();
  expect(requests[1]!.headers.get("x-request-id")).not.toBe(requests[2]!.headers.get("x-request-id"));
});
