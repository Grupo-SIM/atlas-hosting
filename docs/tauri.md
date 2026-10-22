# Tauri (desktop / mobile)

O Atlas é um app Next.js fullstack (server actions, route handlers, banco). Por isso o
Tauri **não embute o frontend**: a janela é uma webview apontando para a URL do Next.

| Build | URL carregada |
| --- | --- |
| `tauri dev` (debug) | `build.devUrl` = `http://localhost:3000` (`next dev`) |
| `tauri build` (release) | `https://atlashosting.com.br` (override em tempo de compilação: `ATLAS_APP_URL`) |

A janela `main` é criada em `frontend/src-tauri/src/lib.rs` (`windows: []` no
`tauri.conf.json`). O capability `main-capability` libera IPC para
`atlashosting.com.br` via `remote.urls`.

## Identidade

- Crate / lib: `atlas-hosting` / `atlas_hosting_lib`
- `productName`: Atlas Hosting · `identifier`: `br.com.atlashosting.app`
- Deep link: `atlas-hosting://`
- Ícones gerados de `frontend/src/app/icon.png` (`bunx tauri icon`)

## Comandos (em `frontend/` ou via raiz)

```bash
bun run tauri:dev      # dev desktop
bun run tauri:build    # bundle release
bun --cwd frontend tauri android dev
```

Pré-requisitos: Rust, e as dependências de sistema do Tauri 2 para o SO alvo.
`frontend/tauri-shell/` é só o `frontendDist` mínimo exigido pelo Tauri.
