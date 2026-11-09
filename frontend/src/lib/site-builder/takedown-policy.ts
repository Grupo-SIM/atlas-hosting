/** Permite desligar o domínio quando a VPS não aceita mais a chave do Atlas. */
export function canDetachWithoutSsh(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /permission denied|authentication failed/i.test(message);
}
