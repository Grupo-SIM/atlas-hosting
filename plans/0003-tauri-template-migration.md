# 0003 — Migração para o layout do template (Tauri)

## Objetivo
Adotar o layout do template `wix` (workspace bun/turbo, `frontend/` + `src-tauri`) sem
trocar Next por Vite/TanStack e sem alterar identidade (`atlas-hosting`).

## Decisões
- Escopo: só o que já existe (frontend, scripts, plans, docs, configs de raiz). Sem
  backend/packages/variants/kubb/i18n do template.
- Tauri = webview para a URL do Next (dev: localhost:3000; release: atlashosting.com.br).
  `output: export` descartado: quebraria server actions/route handlers.
- App Next movido para `frontend/` via `git mv`. `Dockerfile`/`.dockerignore` ficam na
  raiz (contexto do build e pipeline de CD inalterados), buildando o workspace.
- `scripts/` carrega `frontend/.env` (`scripts/load-env.mjs`) e resolve `@/` via
  `scripts/tsconfig.json`. `apply-sql.mjs` agora: `node scripts/apply-sql.mjs frontend/drizzle/NNNN_x.sql`.
- Sem ESLint na raiz (frontend segue com eslint 8 + `.eslintrc.json`); Biome na raiz.

## Fora de escopo
Jobs de release Tauri (desktop/Android) no CD, `.gitattributes` com `eol=lf`
(renormalizaria CRLF existente), skills/AGENTS.md do template.
