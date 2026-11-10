/**
 * Logs do Criador de Sites: publicar, tirar do ar e entregar após o pagamento.
 *
 * Todas as linhas começam com `[PUBLICAR]` e o servidor de destino (`atlas_vm` ou
 * `user_vps`), então dá para filtrar o caminho da VPS do cliente com
 * `grep "\[PUBLICAR\]\[user_vps\]"`. Segredos (senha SSH) nunca entram: quem
 * chama passa só o que pode ser logado e `redact` mascara o resto.
 */

export type PublishTargetTag = "atlas_vm" | "user_vps" | "-";

type Level = "error" | "info" | "warn";

/** Troca cada segredo por `***` em qualquer texto que vá para o log. */
export function redact(text: string, secrets: (string | undefined)[] = []) {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.replaceAll(secret, "***");
  }
  return out;
}

/** Mensagem + código + pilha de um erro qualquer, já sem segredos. */
export function describeError(
  error: unknown,
  secrets: (string | undefined)[] = []
) {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    const text = `${error.name}: ${error.message}${code ? ` [${code}]` : ""}`;
    return redact(
      error.stack
        ? `${text}\n${error.stack.split("\n").slice(1, 6).join("\n")}`
        : text,
      secrets
    );
  }
  return redact(String(error), secrets);
}

/**
 * Traduz o erro bruto do ssh/scp/bash em uma pista do que verificar. Só para o
 * log de quem opera: nunca é devolvida ao navegador.
 */
export function explainDeployError(error: unknown): string | undefined {
  const err = error as NodeJS.ErrnoException & { stderr?: string };
  const text = `${err?.message ?? ""} ${err?.stderr ?? ""}`;
  if (err?.code === "ENOENT") {
    return "binário não encontrado no container (ssh, scp, sshpass, bash ou tar)";
  }
  if (/permission denied|authentication failed/i.test(text)) {
    return "SSH recusou a autenticação: senha errada, ou a chave do Atlas não está autorizada na VPS (e o login por senha/root pode estar desligado no sshd)";
  }
  if (/connection refused/i.test(text)) {
    return "porta 22 fechada ou sshd parado na VPS";
  }
  if (/timed out|timeout/i.test(text)) {
    return "a VPS não respondeu a tempo: IP errado, VPS desligada ou firewall bloqueando a porta 22";
  }
  if (/no route to host|network is unreachable/i.test(text)) {
    return "sem rota até a VPS (IP errado ou VPS fora do ar)";
  }
  if (/could not resolve hostname|name or service not known/i.test(text)) {
    return "o endereço da VPS não resolve";
  }
  if (/host key verification failed|remote host identification/i.test(text)) {
    return "chave do host mudou (a VPS foi reinstalada?)";
  }
  if (/no space left/i.test(text)) return "sem espaço em disco na VPS";
  if (/sudo|command not found|docker/i.test(text)) {
    return "o script de deploy falhou na VPS: confira se o Docker está instalado e se o usuário SSH tem permissão (root)";
  }
  return undefined;
}

function write(
  level: Level,
  target: PublishTargetTag,
  message: string,
  data?: Record<string, unknown>
) {
  const line = `[PUBLICAR][${target}] ${message}`;
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  if (data && Object.keys(data).length > 0) fn(line, data);
  else fn(line);
}

export function publishLogger(target: PublishTargetTag) {
  return {
    error: (message: string, data?: Record<string, unknown>) =>
      write("error", target, message, data),
    info: (message: string, data?: Record<string, unknown>) =>
      write("info", target, message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      write("warn", target, message, data),
  };
}
