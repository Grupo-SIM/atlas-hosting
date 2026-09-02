const gmailApiBaseUrl = "https://gmail.googleapis.com/gmail/v1/users/me";
const verificationSenders = new Set([
  "verification@namecheap.com",
  "support@namecheap.com",
]);
const verificationHosts = new Set([
  "raa.namecheap.com",
  "raa1.namecheap.com",
  "raa.name-services.com",
]);

type GmailMessagePart = {
  body?: { data?: string };
  headers?: { name: string; value: string }[];
  parts?: GmailMessagePart[];
};

type GmailMessage = GmailMessagePart & { id: string };

function gmailConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  };
}

export function gmailVerificationEnabled(): boolean {
  const { clientId, clientSecret, refreshToken } = gmailConfig();
  return Boolean(clientId && clientSecret && refreshToken);
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function header(message: GmailMessagePart, name: string): string {
  return (
    message.headers?.find(item => item.name.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function messageBody(part: GmailMessagePart): string {
  const own = part.body?.data ? decodeBase64Url(part.body.data) : "";
  return `${own}\n${(part.parts ?? []).map(messageBody).join("\n")}`;
}

/** Retorna somente link de confirmação da Namecheap vindo de remetente esperado. */
export function verificationUrlFromNamecheapEmail(
  message: GmailMessage
): string | null {
  const from =
    header(message, "from").match(/<([^>]+)>/)?.[1] ?? header(message, "from");
  const subject = header(message, "subject");
  if (!verificationSenders.has(from.trim().toLowerCase())) return null;
  if (!subject.includes("Verify your contact information")) return null;

  const body = messageBody(message).replaceAll("&amp;", "&");
  const candidates = body.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (
        url.protocol === "https:" &&
        verificationHosts.has(url.hostname) &&
        (url.pathname.includes("raaverification") ||
          url.pathname.includes("ConfirmProfile.aspx")) &&
        (url.searchParams.has("VerificationCode") ||
          url.searchParams.has("VerificationKey"))
      ) {
        return url.toString();
      }
    } catch {
      // Conteúdo de e-mail pode conter URLs incompletas; ignorar com segurança.
    }
  }
  return null;
}

async function gmailAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = gmailConfig();
  if (!clientId || !clientSecret || !refreshToken)
    throw new Error("Credenciais Gmail não configuradas.");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    method: "POST",
  });
  if (!response.ok) throw new Error(`OAuth Gmail retornou ${response.status}.`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("OAuth Gmail não retornou access token.");
  return data.access_token;
}

async function gmailRequest(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${gmailApiBaseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
  });
}

/** Confirma mensagens válidas não lidas e marca somente as aprovadas como lidas. */
export async function approvePendingNamecheapVerifications(): Promise<{
  approved: number;
  skipped: number;
}> {
  if (!gmailVerificationEnabled()) return { approved: 0, skipped: 0 };

  const accessToken = await gmailAccessToken();
  const list = await gmailRequest(
    accessToken,
    `/messages?maxResults=25&q=${encodeURIComponent('is:unread (from:verification@namecheap.com OR from:support@namecheap.com)')}`
  );
  if (!list.ok) throw new Error(`Listagem Gmail retornou ${list.status}.`);
  const data = (await list.json()) as { messages?: { id: string }[] };
  let approved = 0;
  let skipped = 0;

  for (const item of data.messages ?? []) {
    const response = await gmailRequest(
      accessToken,
      `/messages/${item.id}?format=full`
    );
    if (!response.ok) throw new Error(`Leitura Gmail retornou ${response.status}.`);
    const message = (await response.json()) as GmailMessage;
    const url = verificationUrlFromNamecheapEmail(message);
    if (!url) {
      skipped += 1;
      continue;
    }

    const confirmation = await fetch(url, { redirect: "follow" });
    if (!confirmation.ok) {
      console.error(
        `[NAMECHEAP][GMAIL] Confirmação recusada para mensagem ${message.id}: ${confirmation.status}`
      );
      skipped += 1;
      continue;
    }

    const markRead = await gmailRequest(
      accessToken,
      `/messages/${message.id}/modify`,
      {
        body: JSON.stringify({ removeLabelIds: ["UNREAD"] }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }
    );
    if (!markRead.ok)
      throw new Error(`Atualização Gmail retornou ${markRead.status}.`);
    approved += 1;
  }

  return { approved, skipped };
}
