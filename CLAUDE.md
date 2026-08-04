# Atlas Hosting — regras do projeto

## Banco de dados

**Nunca execute nada contra o banco sem autorização explícita do Breno.** Vale para
tudo: `npm run db:push`, `drizzle-kit`, `psql`, `scripts/apply-sql.mjs`, scripts
Node com `pg` — e vale mesmo para mudanças aditivas (`ADD COLUMN` nullable,
`CREATE TABLE`). O banco de `DATABASE_URL` é **produção com dados reais**.

O fluxo correto para mudança de schema:

1. Altere o schema drizzle em `src/lib/db/schema/tables/`.
2. Escreva o `.sql` em `drizzle/` (numerado, ex. `0004_algo.sql`), no formato das
   migrations existentes — statements separadas por `--> statement-breakpoint`.
3. Entregue o comando para o Breno rodar:
   `node scripts/apply-sql.mjs drizzle/0004_algo.sql`

Leituras (`SELECT`, `information_schema`) para conferir estado são permitidas.

### Por que não usar `drizzle-kit push`

O banco tem drift em relação ao schema do código: a tabela `bkp_next_charge_2d` e
a coluna `invoices.data` existem em produção mas não no schema. Todo `push` oferece
apagar as duas — 196 linhas em `invoices`. Sempre responda `No, abort` e aplique a
migration pelo `scripts/apply-sql.mjs`, que roda só o arquivo indicado, em
transação, com rollback em erro.

## Verificação antes de entregar

- `.\node_modules\.bin\tsc --noEmit` — precisa sair limpo.
- `.\node_modules\.bin\biome check --write <arquivos tocados>` — o repo tem
  warnings pré-existentes (`noExplicitAny`, CRLF); não reformate arquivos que você
  não alterou.
- `npm run build` quando a mudança tocar layout, rotas ou server components.

## Convenções

- Componentes shadcn em `src/components/ui/` — reutilize em vez de recriar.
- Textos de interface em português.
- Máscara de dinheiro: input conta centavos da direita para a esquerda
  (digitar `8990` → `89,90`), campo visível formatado com `toLocaleString("pt-BR")`
  e input hidden com ponto decimal para o servidor.
- Server actions devolvem `{ ok: true } | { ok: false; error: string }` quando o
  erro precisa virar toast — `throw` em produção vira mensagem genérica do Next.
