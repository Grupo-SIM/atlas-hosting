// src/app/api/wp-install/route.ts

import axios from "axios";
import { getUser } from "@/lib/auth/index";
import { getSSEPayload } from "./utils";

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
        message: "Parâmetros ausentes na requisição.",
        type: "ERROR",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
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
      JSON.stringify({ message: "Usuário não autenticado.", type: "ERROR" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      }
    );
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    const worker = new Worker(new URL("worker/index.ts", import.meta.url).href);

    worker.onerror = error => {
      console.error("Erro no worker:", error);
    };

    worker.onmessageerror = error => {
      console.error("Erro de mensagem no worker:", error);
    };

    worker.onmessage = event => {
      const { type, message, data } = event.data as {
        type: "INFO" | "ERROR" | "SUCCESS";
        message: string;
        data?: unknown;
      };

      if (data) {
        console.log("WORKER DATA", data);
      }

      writer.write(encoder.encode(getSSEPayload(type, message)));

      if (type === "SUCCESS" || type === "ERROR") {
        writer.close();
      }
    };

    worker.postMessage({
      adminEmail,
      adminPassword,
      adminUsername,
      domainName,
      plugins,
      siteName,
      user,
    });

    await new Promise<void>(resolve => {
      worker.addEventListener("message", event => {
        const { type } = event.data as {
          type: "INFO" | "ERROR" | "SUCCESS";
          message: string;
          data?: unknown;
        };

        if (type === "INFO" || type === "ERROR") {
          resolve();
        }
      });
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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
