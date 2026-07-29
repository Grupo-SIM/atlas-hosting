/**
 * Configurações da API XML do Plesk.
 * Usamos fallback para string vazia para evitar erros durante o build do Docker,
 * já que o Next.js carrega este módulo para análise estática.
 */

const PLESK_XML_API_URL = process.env.PLESK_XML_API_URL || "";
const PLESK_API_LOGIN = process.env.PLESK_API_LOGIN || "";
const PLESK_API_PASSWORD = process.env.PLESK_API_PASSWORD || "";
const PLESK_API_KEY = process.env.PLESK_API_KEY || "";

// Só dispara erro em tempo de execução se as variáveis críticas estiverem vazias
// mas permite que o build continue.
if (
  process.env.NODE_ENV === "production" &&
  !PLESK_XML_API_URL &&
  typeof window === "undefined"
) {
  console.warn("Aviso: PLESK_XML_API_URL não configurada no ambiente.");
}

export {
  PLESK_API_KEY,
  PLESK_API_LOGIN,
  PLESK_API_PASSWORD,
  PLESK_XML_API_URL,
};
