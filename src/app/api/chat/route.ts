const CHAT_PATH = "webhook/6229f9db-8b7f-40ad-8a71-503727e71c34/chat";
const UNAVAILABLE = "Atlas IA indisponível no momento. Tente novamente mais tarde.";

export async function POST(request: Request) {
  // Read through an alias so Next.js does not inline the legacy public variable.
  const environment = process.env;
  const baseUrl = environment.N8N_URL || environment.NEXT_PUBLIC_N8N_URL;
  if (!baseUrl) {
    return Response.json({ output: UNAVAILABLE }, { status: 503 });
  }

  let webhookUrl: URL;
  try {
    webhookUrl = new URL(`${baseUrl.trim().replace(/\/+$/, "")}/${CHAT_PATH}`);
    if (!["http:", "https:"].includes(webhookUrl.protocol)) {
      throw new Error("Invalid n8n protocol");
    }
  } catch {
    return Response.json({ output: UNAVAILABLE }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ output: "Mensagem inválida." }, { status: 400 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      return Response.json({ output: UNAVAILABLE }, { status: 502 });
    }
    const text = await response.text();
    if (response.headers.get("content-type")?.includes("text/html") || /^\s*(?:<!doctype\s+html|<html\b)/i.test(text)) {
      return Response.json({ output: UNAVAILABLE }, { status: 502 });
    }
    return new Response(text, {
      headers: { "Content-Type": response.headers.get("content-type") || "text/plain", "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ output: UNAVAILABLE }, { status: 502 });
  }
}
