# atlas-hosting

Monorepo bun/turbo (layout do template). O app Next.js vive em `frontend/`; o shell
desktop/mobile é Tauri (`frontend/src-tauri/`).

```
frontend/   app Next.js 16 + Drizzle + Tauri
scripts/    scripts operacionais (apply-sql, reprocess, DNS)
docs/       documentação
plans/      planos versionados
```

## Desenvolvimento

```bash
bun install
bun run dev            # Next em http://localhost:3000
bun run tauri:dev      # janela Tauri apontando para o Next local
bun run build          # next build (standalone)
```

Variáveis de ambiente ficam em `frontend/.env`. Detalhes do Tauri em
[docs/tauri.md](docs/tauri.md).

## Atlas IA

Configure `N8N_URL` com a URL base do n8n no ambiente do servidor em execução
(exemplo: `https://n8n.example.com`). `NEXT_PUBLIC_N8N_URL` continua aceita como
fallback. Ambos os chats usam `/api/chat`, que encaminha mensagens ao webhook
no servidor; a configuração não precisa estar disponível durante o build Docker.
