/**
 * Depois de um deploy, uma aba que ficou aberta ainda tem o código da versão anterior: as ações do servidor que ela
 * chama deixam de existir e o Next responde "Server Action … was not found on the server". Não é falha do arquivo nem
 * do site da pessoa: basta recarregar a página. Este módulo reconhece o caso e dá a mensagem certa.
 */
export const STALE_ACTION_MESSAGE =
  "O Atlas foi atualizado enquanto esta página estava aberta. Recarregue a página (F5) para continuar; o que você não salvou fica guardado neste navegador e pode ser recuperado.";

export function isStaleActionError(error: unknown): boolean {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return /server action .*not found|failed to find server action/i.test(text);
}

/** Se o erro é de página desatualizada, a mensagem em português; senão, `null` (quem chama trata como antes). */
export const staleActionMessage = (error: unknown): string | null =>
  isStaleActionError(error) ? STALE_ACTION_MESSAGE : null;

/**
 * O texto de um erro de ação do servidor para mostrar na tela: página desatualizada vira a mensagem de recarregar;
 * erro técnico do Next ("An error occurred in the Server Components render…") vira um aviso comum; o resto passa.
 */
export function friendlyError(
  error: unknown,
  fallback = "Não foi possível concluir. Tente de novo."
): string {
  const stale = staleActionMessage(error);
  if (stale) return stale;
  const text = error instanceof Error ? error.message.trim() : "";
  if (
    !text ||
    /server components render|body exceeded|failed to fetch|fetch failed|network|unexpected response|digest/i.test(
      text
    )
  )
    return fallback;
  return text;
}
