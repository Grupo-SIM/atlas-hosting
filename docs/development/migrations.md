# Migrations no deploy

`compose.production.yaml` define um serviço `migrate` de execução única, que roda
`bun run migrate:deploy` (`frontend/scripts/migrate.ts`) antes do app. O serviço
`frontend` depende dele com `service_completed_successfully`: só sobe depois que as
migrations terminam, e uma migration com falha aborta o `docker compose up` e mantém
os containers anteriores.

```sh
docker compose -f compose.production.yaml pull
docker compose -f compose.production.yaml up -d
```

## Imagens

O CD publica `ghcr.io/<owner>/<repo>_frontend` e `ghcr.io/<owner>/<repo>_migrate`
(`frontend/Dockerfile.migrate`, com Bun e apenas `frontend/drizzle`; o contexto é
limitado por `frontend/Dockerfile.migrate.dockerignore`). `FRONTEND_IMAGE` e
`MIGRATE_IMAGE` sobrescrevem as imagens e, por padrão, usam `latest`. Em deploys reais,
fixe as duas na mesma tag `sha-<commit>`: a migration precisa ser da mesma versão do app.

## Como o runner funciona

Os arquivos de `frontend/drizzle/*.sql` são escritos à mão e não têm journal do
drizzle-kit, então `drizzle-kit migrate` não se aplica (e `db:push` não instala triggers
como o de vouchers). O runner aplica os `.sql` em ordem de nome, cada um em uma
transação, e registra o nome em `schema_migrations`. Usa `DIRECT_URL` (ou `DATABASE_URL`,
sem parâmetros do pgbouncer) e um advisory lock, então execuções concorrentes esperam.

Para adicionar uma migration, crie `frontend/drizzle/NNNN_descricao.sql` com o próximo
número. Não edite arquivos já aplicados.

## Primeira execução em banco existente

Bancos que já receberam migrations manualmente não têm `schema_migrations`. O runner
**se recusa a adivinhar** e falha até que o operador informe o último arquivo já aplicado:

```sh
MIGRATE_BASELINE=0011_site_builder_publications.sql docker compose -f compose.production.yaml run --rm migrate
```

O baseline registra esse arquivo e os anteriores sem executá-los. Use `none` para um
banco vazio. Confirme no banco quais migrations realmente foram aplicadas antes de
escolher o valor. Depois disso, o deploy normal não precisa mais da variável.

## Compatibilidade

A migration roda antes do novo app, então a versão anterior atende tráfego por um
instante com o schema novo: mantenha as migrations retrocompatíveis (expandir agora,
contrair em um release posterior).
