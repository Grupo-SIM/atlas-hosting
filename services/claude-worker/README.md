# claude-worker

Serviço do Atlas que hospeda o Claude Code autenticado na **assinatura do próprio usuário** (um
`CLAUDE_CONFIG_DIR` por usuário). Usado pela aba **IA** do Criador de Sites. Visão geral em
`docs/development/site-builder.md` ("Atlas IA").

Sem dependências npm: Node 24 roda o TypeScript direto (`node src/index.ts`).

## Rotas (todas exigem o cabeçalho `x-worker-token`)

| Rota | O que faz |
| --- | --- |
| `GET /health` | vivo |
| `GET /accounts/:userId/status` | `{connected, email?, plan?}` (`claude auth status`; só conta `claude.ai`) |
| `POST /accounts/:userId/auth/start` | inicia `claude auth login`, devolve `{loginId, url}` |
| `POST /accounts/:userId/auth/finish` | `{loginId, code}` → status |
| `DELETE /accounts/:userId` | apaga o login do usuário |
| `POST /chat` | um turno; resposta NDJSON: `delta`, `tool`, `done` ou `error` |

## Segurança

- Credenciais de API (`ANTHROPIC_API_KEY`…) são removidas do ambiente no boot: venceriam o login e cobrariam por token.
- `claude -p` roda com `--tools ""` (sem Bash/Read/Edit/Write…) e `managed-settings.json` nega as nativas de novo.
  As únicas ferramentas são as do Atlas (ponte MCP → `/api/site-builder/ai/tool/<turno>` do frontend).
- Recusa subir sem `CLAUDE_WORKER_TOKEN`. Não use `env_file: .env` neste container.
- O volume `/state/claude` guarda os logins: não rode `docker compose down -v`.

## Rodar local

```bash
cd services/claude-worker
CLAUDE_WORKER_TOKEN=dev WORKER_USERS_DIR=/tmp/claude-users node src/index.ts   # exige `claude` no PATH
bunx tsc --noEmit -p tsconfig.json                                              # tipos
```

No frontend (`frontend/.env`): `CLAUDE_WORKER_URL=http://localhost:3000`, `CLAUDE_WORKER_TOKEN=dev` e
`ATLAS_AI_CALLBACK_URL=http://localhost:<porta do next dev>` (o worker chama o frontend de volta).

## Imagem

`docker build -f services/claude-worker/Dockerfile .` (contexto = raiz do repo). A versão do CLI é fixada no
Dockerfile (`CLAUDE_CODE_VERSION`): o worker lê `stream-json` e o texto do login, que mudam entre versões;
ao subir, teste login e um chat.
