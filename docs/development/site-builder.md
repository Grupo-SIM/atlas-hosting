# Criador de Sites (`@repo/site-builder`)

Módulo de criação de sites a partir de templates (estilo Wix/WordPress). A lógica vive
em `packages/site-builder`; o Atlas só tem as telas e a infraestrutura (banco, storage,
DNS, deploy) em `frontend/src/app/(auth)/criador-de-sites/` e `frontend/src/lib/site-builder/`.
Leia também [o guia de scaffolding](project-scaffolding.md) antes de mexer em exports ou Turbo.

## Acesso

Por enquanto o recurso é **só do admin**: item `adminOnly` na sidebar (`navigation.ts`), `layout.tsx` e páginas
com 404 para não-admin, e toda server action recusa quem não é admin. A regra fica em `lib/site-builder/access.ts`
(usuário real, ignorando impersonação). Para liberar a todos, mude essa regra e o `adminOnly` do item de menu.

## Fluxo e UI

UI portada do protótipo "UI editor de sites" (neutros quentes, lima `#d6f34a` nas ações, roxo na seleção).
Telas em `frontend/src/app/(auth)/criador-de-sites/`:

1. `/criador-de-sites` — **Meus sites**: cartões com miniatura ao vivo (`ScaledSite`), status vindo de `builder_publications`.
2. `/criador-de-sites/novo` — **Templates**: busca, filtros por `tags` do template, destaque + grade.
3. `/criador-de-sites/novo/[templateId]` — **Configurar** (nome + endereço) e **progresso**. `createSite` cria o
   registro e `publishSite` publica no endereço escolhido; "Definir depois" só cria. Os passos de progresso são
   cronometrados enquanto a publicação (uma chamada só) roda.
4. `/criador-de-sites/[siteId]` — **Editor**; "Revisar e publicar" salva e chama `republishSite` (mesmo endereço/servidor
   da última publicação). Sem publicação ainda, o modal leva para `/[siteId]/publicar`, que continua existindo.

O editor (`packages/site-builder/src/editor/`) tem camadas (árvore de blocos), aba Páginas (páginas, posts, categorias, menu),
aba IA (Atlas IA, veja abaixo), canvas com desktop/tablet/celular + zoom, desfazer/refazer, autosave (1,5 s) e inspetor à direita
(conteúdo do bloco, tipografia, caixa; sem seleção, o tema). Lista de alterações do modal fica em `localStorage` por site.

- `Block.style` (allowlist em `model/style.ts`, validada no `siteSchema`) e `Block.hidden` valem para **qualquer** bloco e
  são aplicados no contêiner do bloco; o que o bloco desenha por dentro continua definido pelo próprio bloco.
- `Block.fx` (`model/fx.ts`) guarda efeitos por item: chave `""` = o bloco, senão o caminho `nth-child` do elemento (mesmo de `elStyles`).
  Entrada ao rolar (`fadeIn*`, `zoomIn` + atraso), hover (`pop`, `grow`, `shrink`), parallax (−10..10), contador e `each` (aplica a cada filho).
  O CSS é gerado por `fxCss`; entrada/parallax/contador dependem do script `renderer/fx-runtime.ts` (inline no HTML publicado, `FxRuntime` na prévia).
  O estado inicial da entrada só vale com `.sb-js`, que o script põe na raiz — no editor (`mode="edit"`) e sem JS o conteúdo aparece parado.
- Ícones do editor são um subconjunto do lucide em `editor/icons.tsx` (gerado; sem dependência nova).
- `SiteRenderer` aceita `narrow` para forçar o layout estreito no preview de celular/tablet (a media query não enxerga o quadro).

## Pacote

| Entry | Uso |
| --- | --- |
| `@repo/site-builder` | modelo (`Site`, `Page`, `Post`…), `siteSchema`, registry de blocos, `SiteRenderer`, templates, `resolveRoute`/`slugify` |
| `@repo/site-builder/editor` | `SiteEditor` (client component, `"use client"`) |
| `@repo/site-builder/static` | `exportSiteToStatic(site)` → arquivos HTML; **só no servidor** |

- Um site inteiro é um JSON (`Site`): páginas, posts, categorias, menu, header/footer, layouts de post e
  de categoria e tema. Conteúdo = árvore de **blocos** (`Block { id, type, props, children? }`).
- Para criar um bloco: `defineBlock(schemaZod, { fields, render, ... })` em `src/blocks/definitions.tsx` e
  adicione à lista `blockDefinitions`. `fields` alimenta o painel de propriedades do editor automaticamente.
- Rotas (estilo WordPress): `/category/:slug`, depois página (`/:slug`, home = slug vazio), depois post (`/:slug`).
  Páginas, posts e o prefixo `category` dividem o mesmo espaço de URLs (`isSlugTaken`).
- Template = dado em `src/templates/<id>/`, registrado em `src/templates/index.ts`. `getTemplate` devolve cópia profunda.
  Lista atual: `blog-viagens` (genérico, imagens Unsplash) e `portal-noticias` (portal estilo G1: variante `portal` em
  `renderer/portal.ts` + blocos `newsFront`/`newsFeed`/`shortVideos`, header com `topLinks`/`featuredLabel`, e página `/portal/` (vitrine) com blocos `hub*` em `blocks/portal-hub.tsx`; páginas de seção `/esporte/`, `/entretenimento/`, `/receitas/`, `/lifestyle/`, `/tv/` que trocam a cor da marca via bloco `skinBar` (CSS `:has(.sb-skin[data-skin])` em `portal.ts`); textos legais reaproveitados do blog). `spyhacker` fica em `legacyTemplates`: some da tela de escolha, mas
  `getTemplate` ainda o resolve — sites criados com ele usam o original para "restaurar" no editor.
- Variante `spyhacker` (`theme.variant = "spyhacker"`, CSS em `renderer/spyhacker.ts`, escopo `.sb-sh`): medidas copiadas
  do 007spyhacker.com (Elementor) para cabeçalho/menu, `/categorias/`, `/category/:slug`, posts e rodapé. Os dados do
  template (categorias, capas, datas, títulos, resumos) vêm da API do WordPress do site original. Blocos com props para isso:
  `categoryGrid.items` (ordem/rótulo dos cards), `featuredPost.showImage`/`buttonLabel`, `postList.cardStyle`/`includeCurrent`,
  `postShare` e `postNav`. No celular o menu vira gaveta lateral (checkbox `#sb-burger` + label `.sb-burger-backdrop`
  para fechar), com fundo em `header.menuBg` (só `#rrggbb`, vira a var `--sb-menu-bg`). Sites sem a variante não mudam.
- Camadas: arrastar um bloco reordena (antes/depois/dentro de contêiner, ou no início/fim da seção); `moveBlockTo`/`insertBlockAt` em `editor/tree.ts`. Ligar Anúncios cria um bloco `adSlot` real em cada página (`withAdBlocks`), então ele aparece e se move nas camadas.
- Arrastar no canvas tem 3 modos (controle "Item | Bloco | Livre" na barra; Shift inverte Item/Bloco): **Item** e **Bloco** reordenam ao vivo (`editor/sort-drag.ts`): ao passar sobre um irmão, os dois trocam de lugar com animação FLIP. A ordem é CSS `order` (inline no arrasto; depois `elStyles[...].order` via `setElementOrders`, com `display:flex` no pai se ele era bloco). Bloco grava a ordem na árvore (`moveBlockTo`). Item sobe até um nível com irmãos. Rola sozinho perto da borda. **Livre** desloca sem trocar (abaixo).
- Mover livre (`editor/free-move.ts`): no canvas, segurar e arrastar qualquer item muda `translate: Xpx Ypx` no estilo do bloco (`style`) ou do elemento (`elStyles`), sem mexer no fluxo. Encaixa nas bordas/centros vizinhos (guias rosa; Alt desliga), Shift trava o eixo, setas empurram 1 px (Shift 10 px); o painel "Posição" tem X/Y e "Voltar ao lugar original". Só vale em tela larga (`translateCss`: `@media (min-width:861px)`; `.sb-narrow` zera). Texto em linha ganha `display:inline-block` junto, senão o `translate` não vale. Desktop apenas: o arrasto fica desligado no preview de tablet/celular.
- Anúncios: botão "Anúncios" na barra do editor (e no painel do tema) liga `theme.ads = "on"`; desligado, nenhum espaço aparece.
  Bloco `adSlot` (`blocks/ads.tsx`, formato faixa/lateral/quadrado) e o `newsFeed` (prop `adItems`, abaixo de "Mais lidas") usam o
  `AdBox`: lista de imagens/vídeos que passam sozinhos, sem botões (rotação em `fx-runtime.ts`; imagem por N segundos, vídeo até o
  fim, mudo). Espaço sem mídia própria usa os anúncios do site inteiro (`theme.adsConfig`, JSON `{banner, side}`, editado no painel do tema); sem nenhum, some no site e aparece tracejado no editor. O template Portal tem a faixa em todas as páginas (exceto 404) e no layout de post/categoria. O campo `media` do painel aceita imagem ou vídeo; o
  vídeo (MP4/WebM, até 25 MB) vai por `uploadSiteVideo` e o tipo é lido pela extensão da URL. `serverActions.bodySizeLimit` = 30 MB.
- `react-dom/static` (e não `react-dom/server`) renderiza o HTML estático: o Next recusa `react-dom/server` em código do app router.
- Links digitados pelo usuário passam por `safeUrl` (bloqueia `javascript:`/`data:`). Use-o em todo `href` novo vindo de props.

## Atlas IA (aba "IA")

O usuário conecta a **própria assinatura Claude** (Pro/Max) e conversa para editar o site e tirar dúvidas do editor.
Mesmo desenho do alfajuri: nenhuma chave de API do Atlas é usada.

```
navegador ── POST /api/site-builder/ai/chat (NDJSON) ──► frontend ──► claude-worker ──► claude -p
                                                            ▲                              │ MCP (stdio)
                                                            └── POST /api/site-builder/ai/tool/<turno> ◄── mcp-bridge
```

- **`services/claude-worker`** (fora dos workspaces; imagem própria, CD em `cd-claude-worker.yml`): um `CLAUDE_CONFIG_DIR`
  por usuário num volume (`claude-state`), login por `claude auth login` (link + código), um `claude -p` por turno **sem
  nenhuma ferramenta nativa** (`--tools ""`): só as do Atlas, via ponte MCP (`mcp-bridge.ts`). Remove do ambiente qualquer
  credencial de API (venceria o login e cobraria por token) e recusa subir sem `CLAUDE_WORKER_TOKEN`. Ver o README da pasta.
- **Ferramentas** (`packages/site-builder/src/ai/tools.ts`): `AI_TOOLS` + `runAiTool(site, nome, entrada)`, funções puras sobre o JSON
  do `Site` (reusam `editor/tree.ts` e `site-ops.ts`). Validam props contra o schema do bloco (`BlockDefinition.schema`) e o
  site inteiro contra `siteSchema` antes de devolver; erro vira mensagem para a IA corrigir. **Novo recurso do site = nova
  ferramenta aqui.**
- **Turno** (`frontend/src/lib/site-builder/ai/turns.ts`): o `/chat` recebe o site atual do navegador (inclui o que ainda
  não salvou), guarda uma cópia de trabalho em memória e a rota `/tool/<turno>` (autorizada só pelo token do turno) aplica
  cada ferramenta nela e avisa o navegador com `{type:"site"}`. O editor aplica com `edit(...)`, chave `ai:<turno>`:
  **um turno inteiro = um Ctrl+Z**. Durante o turno o editor trava (`sbe-ailock`) para a edição manual não ser sobrescrita.
- **Guia de contexto** (`packages/site-builder/src/ai/guide.ts`, `EDITOR_GUIDE`): onde fica cada ferramenta do editor, receitas
  ("como envio uma fonte?", "como coloco anúncios?") e o que a IA pode/não pode fazer. Entra inteiro no prompt de sistema
  (`prompt.ts`). **Ao criar ou mover qualquer recurso/botão/painel do editor, atualize este arquivo.** Os tipos de bloco não
  ficam nele: a IA os lê pela ferramenta `tipos_de_bloco`.
- A IA **não** envia arquivos, publica, nem mexe em domínio/servidor/DNS (o guia manda explicar o passo a passo).
- Acesso: mesmas regras do criador (admin; `getBuilderUser`). Conversa guardada só em `localStorage` por site.

Variáveis do **frontend** (`.env`): `CLAUDE_WORKER_URL` (ex. `http://claude-worker:3000`), `CLAUDE_WORKER_TOKEN` (o mesmo do
worker), `ATLAS_AI_CALLBACK_URL` (como o worker enxerga o frontend; padrão `http://frontend:3000`). Sem as duas primeiras a aba
mostra "Atlas IA indisponível". O worker recebe só `CLAUDE_WORKER_TOKEN` (sem `env_file`, para não ver segredos do app).

## Banco

- `builder_sites` (`0010_site_builder.sql`): um registro por site, conteúdo inteiro em `content jsonb`.
- `builder_publications` (`0011_site_builder_publications.sql`): domínio + servidor de cada site.
- O banco é produção. Quem aplica é o Breno: `node scripts/apply-sql.mjs frontend/drizzle/0010_site_builder.sql` e depois a `0011`.

## Publicação

`publishSite` (`publish-actions.ts`): valida dono do site e do domínio → `exportSiteToStatic` →
`deploySite` (`lib/site-builder/deploySite.ts`, mesmo padrão SSH/SCP do `setupSentinela`, com `execFile`
para rodar no Node do container) → DNS A no Cloudflare → grava `builder_publications`.

Premissa: as VPS rodam **caddy-docker-proxy** com `/srv/www` visível ao container no mesmo caminho e o
Caddyfile base em `/opt/caddy/Caddyfile.base`. Para cada site o script remoto (`lib/site-builder/caddy.ts`):

1. sob `flock`, confere que o domínio não está configurado no `Caddyfile.base` fora do Atlas (se estiver, aborta);
2. extrai os arquivos em `/srv/www/<dominio>.new-*` e troca `/srv/www/<dominio>`;
3. substitui (ou acrescenta) no `Caddyfile.base` o bloco do site, entre os marcadores
   `# BEGIN atlas-site <dominio>` / `# END atlas-site <dominio>`, guardando backup em `Caddyfile.base.atlas-bak`.
   O arquivo é regravado no mesmo inode, então funciona mesmo montado no container.

O bloco serve `root * /srv/www/<dominio>` com `file_server`, gzip e `404.html`; `www.` só entra em domínio próprio.
O HTTPS é automático (Let's Encrypt no primeiro acesso, depois do DNS propagar) — não há passo de certificado.
**O script não recarrega o Caddy**: o caddy-docker-proxy relê o arquivo base no próximo ciclo de polling
(`--polling-interval`, 30 s por padrão). Se as VPS usarem outro valor ou desligarem o polling, o site só aparece
após um reload manual. Um bloco inválido no `Caddyfile.base` derruba todos os sites da VPS: por isso o bloco é
gerado só de domínio validado, com backup a cada deploy.

Variáveis de ambiente (ver `lib/site-builder/config.ts`):

- `SITE_BUILDER_BASE_DOMAIN` e `SITE_BUILDER_CLOUDFLARE_ZONE` — subdomínios grátis (`<nome>.<base>`).
- `SITE_BUILDER_ATLAS_VM_HOST` (ou o nome antigo `SITE_BUILDER_ATLAS_VM_IP`) — IP **ou hostname/CNAME** (ex.: `vps.simintermediacoes.com`) da VM do Atlas que hospeda sites; com hostname o DNS do site vira CNAME. **Sem ela a opção fica desligada** (a taxa de hospedagem ainda não existe).
- `SITE_BUILDER_SSH_KEY_PATH` — chave privada do Atlas para acessar as VMs.
- `SITE_BUILDER_DEPLOY_MODE=local` — o Atlas roda **na própria VM** dos sites: o script de deploy roda dentro do container (bash), sem SSH/chave. Exige montar `/opt/caddy:/opt/caddy` no container.
- `SITE_BUILDER_WEB_ROOT` / `SITE_BUILDER_CADDY_ROOT` — pasta dos sites na VM e o mesmo caminho como o container do Caddy a enxerga (ex.: `/opt/caddy/sites` e `/config/caddy/sites`; padrão `/srv/www` nos dois).

Notas de segurança:

- Todo domínio que vira caminho/bloco do Caddyfile/argumento remoto passa por `assertValidDomain`/`assertValidNetwork` (`caddy.ts`, testado em `caddy.test.ts`).
- A senha SSH da VPS do usuário é usada só na chamada (`sshpass -e`, fora da lista de processos) e nunca gravada;
  mensagens de erro têm a senha removida antes de voltar ao navegador.
- `StrictHostKeyChecking=no` segue o padrão do Sentinela (VPS recém-criadas).

## Pendências conhecidas

- Taxa de hospedagem na VM do Atlas (valor definido pelo admin) e cobrança.
- Compra de domínio dentro do fluxo de publicar; despublicar (remover pasta em /srv/www e o bloco do Caddyfile.base).
- Imagens do template spyhacker ainda apontam para `007spyhacker.com/wp-content/uploads`; as do `blog-viagens` apontam para `images.unsplash.com`. Copiar ambas para o storage.
- Edição de texto direto no canvas (duplo clique) e seleção por elemento: hoje a unidade é o bloco; texto muda no painel.
- Passos de progresso reais na criação.
- Arrastar e soltar existe só nas camadas (blocos, inclusive aninhados, e itens da lista "Adicionar bloco"); itens soltos dentro de um bloco (ex.: um card do feed) e a troca de ordem dos itens dentro de um bloco ainda não (o canvas só desloca, não reordena).
