# Migração: Adicionar campo `code` na tabela de verificação de email

## Descrição
Adiciona o campo `code` (código de 5 dígitos) na tabela `email_verification_tokens` para permitir verificação por código ao invés de apenas por token.

## SQL Migration

```sql
-- Adicionar coluna code na tabela email_verification_tokens
ALTER TABLE email_verification_tokens 
ADD COLUMN IF NOT EXISTS code TEXT NOT NULL DEFAULT '00000';

-- Remover o default após adicionar (os novos registros já terão código gerado)
ALTER TABLE email_verification_tokens 
ALTER COLUMN code DROP DEFAULT;

-- Criar índice para busca rápida por código e email
CREATE INDEX IF NOT EXISTS idx_email_verification_code_email 
ON email_verification_tokens(code, email);
```

## Como executar

1. Conecte ao banco de dados:
```bash
psql postgresql://atlas:atlas123@localhost:5432/atlas_hosting
```

2. Execute o SQL acima

Ou use o Drizzle para fazer push do schema:
```bash
bun run db:push
```

## Nota
Os tokens existentes terão código '00000' como padrão. Eles não funcionarão para verificação por código, apenas por token (compatibilidade retroativa).

