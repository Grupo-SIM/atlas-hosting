// src/app/api/wp-install/route.ts
import { getUser } from "@/lib/auth/index";

import axios from "axios";
import { getSSEPayload, sendSSE } from "./utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const domainName = urlParams.get("domain");
  const adminUsername = urlParams.get("admin_username");
  let adminPassword = urlParams.get("admin_password");
  let siteName = urlParams.get("site_name");
  let adminEmail = urlParams.get("admin_email");
  const formPlugins = urlParams.get("plugins");

  if (
    !domainName ||
    !adminUsername ||
    !adminPassword ||
    !siteName ||
    !adminEmail
  ) {
    // Not using SSE here as it's a preliminary a before stream starts
    return new Response(
      JSON.stringify({
        type: "ERROR",
        message: "Parâmetros ausentes na requisição.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  adminPassword = decodeURIComponent(adminPassword);
  siteName = decodeURIComponent(siteName);
  adminEmail = decodeURIComponent(adminEmail);

  const user = await getUser();
  const plugins = formPlugins ? formPlugins.split(",") : [];

  if (!user) {
    return new Response(
      JSON.stringify({ type: "ERROR", message: "Usuário não autenticado." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const worker = new Worker(new URL("worker/index.ts", import.meta.url).href);

    worker.onerror = (error) => {
      console.error("Erro no worker:", error);
    };

    worker.onmessageerror = (error) => {
      console.error("Erro de mensagem no worker:", error);
    };

    worker.onmessage = (event) => {
      const { type, message, data } = event.data as {
        type: "INFO" | "ERROR" | "SUCCESS";
        message: string;
        data?: unknown;
      };

      writer.write(encoder.encode(getSSEPayload(type, message, data)));

      if (event.data.type === "SUCCESS" || event.data.type === "ERROR") {
        writer.close();
      }
    };

    worker.postMessage({
      user,
      domainName,
      adminEmail,
      adminPassword,
    adminUsername,
      plugins,
      siteName,
    });
  } catch (error) {
    console.error("Erro geral no processo de instalação:", error);
    let errorMsg = "Erro desconhecido durante a instalação.";
    let errorDetails = {};
    if (axios.isAxiosError(error)) {
      errorDetails = error.response?.data;
      errorMsg = `Erro de API: ${error.response?.data?.message || error.message}`;
    } else if (error instanceof Error) {
      errorMsg = error.message;
    }

    writer.write(
      encoder.encode(getSSEPayload("ERROR", `Falha na instalação: ${errorMsg}`))
    );
  }

  return new Response(responseStream.readable, {
    headers: {
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
