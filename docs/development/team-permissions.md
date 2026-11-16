# Equipe e permissões por área

Em **Administração → Usuários** o admin (e quem tem acesso de edição a "Usuários") cria usuários de equipe com acesso
por área: **Visualizador** (só consulta), **Editor** (cada área em Visualiza ou Edita) e **Administrador** (edita tudo,
inclusive Usuários e cria outros). Tela: `frontend/src/app/(auth)/admin/users/TeamManager.tsx`.

## Peças

- **Catálogo** (`lib/permissions/catalog.ts`): fonte única das áreas (chave, rótulo, descrição, ⚠ `sensitive`),
  `resolveLevels` (perfil + "todas as áreas" + permissões soltas → nível por área) e `areaForAdminPath`.
  Área com `available: false` aparece "em breve" e **não pode ser concedida** (o painel do cliente ainda não checa).
- **Regra de concessão** (`lib/permissions/grant.ts`, `normalizeGrant`): ninguém concede mais do que tem; "todas as áreas"
  deixa Usuários de fora; Administrador só por quem edita tudo; área inexistente é recusada.
- **Acesso** (`lib/permissions/access.ts`): `hasAreaAccess(user, área, 'view'|'edit')`, `requireAreaPage` (páginas),
  `requireAreaAction` (ações), `hasAnyAdminArea`/`viewableAdminAreas` (sidebar e painel /admin), `levelsFor`.
  Admin completo (`isAdmin`) tem tudo sem consultar o banco.
- **Ações de equipe** (`admin/users/team-actions.ts`): criar, editar (senha opcional, derruba sessões) e remover (suspende,
  apaga senha e permissões). Toda ação refaz a checagem; o alvo tem que estar na árvore de quem chama.
- **Banco**: `user_access` (quem criou, perfil, `access_all`) e `user_area_permissions` (área → view|edit), migration
  `frontend/drizzle/0015_user_access.sql`. A tabela `users` **não muda**: nenhuma consulta de usuário depende destas
  tabelas, e se elas não existirem o usuário de equipe fica sem acesso (silenciosamente) e o resto do sistema segue.

## Regras que não podem quebrar

- **Server Actions são POSTs públicos.** A checagem de área vai dentro da própria ação (`hasAreaAccess(user, área, 'edit')`),
  não só na página. Não confie em `x-pathname`/layout para autorizar.
- Usuário de equipe **nunca** recebe `isAdmin`. Tudo que continua `isAdmin` (promover a admin, impersonar, e-mails em massa)
  é só de admin completo de propósito.
- Área nova de administração: adicione ao catálogo, proteja a página (`requireAreaPage`) **e** cada ação (`hasAreaAccess`),
  e mapeie a rota em `ADMIN_ROUTE_AREAS`. Sem isso, usuário de equipe não entra (falha fechada).
- Equipe é criada com organização própria (vazia) e `emailVerified` preenchido (entra direto com a senha definida).

## Falta (fase B)

Áreas do painel do cliente (hospedagem, domínios, e-mail, faturas, Criador de Sites) com o usuário de equipe enxergando a
conta de quem o criou. Hoje a equipe só opera áreas de administração.
