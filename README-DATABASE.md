# Configuração do Banco de Dados Local

Este guia explica como configurar e usar um banco de dados PostgreSQL local para desenvolvimento.

## Opção 1: Usando Docker (Recomendado)

### 1. Iniciar o PostgreSQL via Docker Compose

```bash
docker-compose up -d postgres
```

Isso irá:
- Criar um container PostgreSQL na porta 5432
- Criar o banco `atlas_hosting`
- Usuário: `atlas`
- Senha: `atlas123`

### 2. Configurar o arquivo `.env`

Adicione ao seu arquivo `.env`:

```env
DATABASE_URL=postgresql://atlas:atlas123@localhost:5432/atlas_hosting
```

### 3. Gerar as tabelas do banco

```bash
bun run db:push
```

Este comando irá criar todas as tabelas necessárias baseadas no schema em `src/lib/db/schema/`.

### 4. Verificar se funcionou

```bash
# Conectar ao banco via psql (se tiver instalado)
psql postgresql://atlas:atlas123@localhost:5432/atlas_hosting

# Ou usar Docker
docker exec -it atlas-hosting-postgres psql -U atlas -d atlas_hosting
```

## Opção 2: PostgreSQL Instalado Localmente

### 1. Instalar PostgreSQL

**Windows:**
- Baixe do site oficial: https://www.postgresql.org/download/windows/
- Ou use Chocolatey: `choco install postgresql`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Criar o banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco e usuário
CREATE DATABASE atlas_hosting;
CREATE USER atlas WITH PASSWORD 'atlas123';
GRANT ALL PRIVILEGES ON DATABASE atlas_hosting TO atlas;
\q
```

### 3. Configurar o arquivo `.env`

```env
DATABASE_URL=postgresql://atlas:atlas123@localhost:5432/atlas_hosting
```

### 4. Gerar as tabelas

```bash
bun run db:push
```

## Verificar Conexão

Para testar se a conexão está funcionando, você pode executar:

```bash
# Usando Node.js/Bun
node -e "require('pg').Pool({connectionString: process.env.DATABASE_URL}).query('SELECT NOW()', (err, res) => console.log(err || res.rows))"
```

## Comandos Úteis

### Parar o banco Docker
```bash
docker-compose stop postgres
```

### Iniciar o banco Docker
```bash
docker-compose start postgres
```

### Ver logs do banco Docker
```bash
docker-compose logs -f postgres
```

### Remover o banco Docker (CUIDADO: apaga todos os dados)
```bash
docker-compose down -v postgres
```

### Fazer backup do banco
```bash
docker exec atlas-hosting-postgres pg_dump -U atlas atlas_hosting > backup.sql
```

### Restaurar backup
```bash
docker exec -i atlas-hosting-postgres psql -U atlas atlas_hosting < backup.sql
```

## Troubleshooting

### Erro: "connection refused"
- Verifique se o PostgreSQL está rodando
- Verifique se a porta 5432 está disponível
- Verifique as credenciais no `.env`

### Erro: "database does not exist"
- Execute `bun run db:push` para criar as tabelas
- Ou crie o banco manualmente: `CREATE DATABASE atlas_hosting;`

### Erro: "password authentication failed"
- Verifique o usuário e senha no `.env`
- Para Docker: use `atlas` / `atlas123`
- Para PostgreSQL local: verifique as credenciais que você criou

