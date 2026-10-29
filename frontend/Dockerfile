# Estágio 1: Instalação de dependências
FROM oven/bun:1.4.3 AS deps
WORKDIR /usr/src/app

# Copia arquivos de definição de pacotes
COPY package.json bun.lock ./
COPY frontend/package.json frontend/package.json
COPY packages/site-builder/package.json packages/site-builder/package.json

# Instala as dependências usando o cache do Bun de forma eficiente
RUN bun install --frozen-lockfile --ignore-scripts

# Estágio 2: Build da aplicação
FROM deps AS builder
WORKDIR /usr/src/app

# Preserva dependências da raiz e do workspace, inclusive links locais do Bun.
COPY . .

# Marca o instante deste build (invalida com COPY . . acima, então muda a cada build real)
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > BUILD_TIME

# Variáveis de ambiente de build
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build otimizado (usa o modo standalone configurado no frontend/next.config.js)
RUN bunx turbo run build --filter=frontend

# Estágio 3: Runner de produção (Imagem final leve e estável)
FROM node:20-slim AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
# Next.js standalone server.js binds to process.env.HOSTNAME.
# Docker auto-sets HOSTNAME to the container ID, so it must be forced to 0.0.0.0
# or Traefik cannot reach the container (Bad Gateway).
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Criador de Sites: o deploy dos sites usa ssh/scp (com sshpass para VPS de cliente) e tar.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssh-client sshpass \
  && rm -rf /var/lib/apt/lists/*

# Copia apenas o necessário para rodar a aplicação (Modo Standalone)
# O standalone do Next.js contém apenas os arquivos necessários para rodar sem node_modules gigantes
# Workspace: o standalone sai com o servidor em frontend/server.js
COPY --from=builder /usr/src/app/frontend/public ./frontend/public
COPY --from=builder /usr/src/app/frontend/.next/standalone ./
COPY --from=builder /usr/src/app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /usr/src/app/BUILD_TIME ./BUILD_TIME

EXPOSE 3000

# No modo standalone, o ponto de entrada é o frontend/server.js
# Usamos Node aqui para garantir 100% de compatibilidade com o servidor standalone do Next
CMD ["node", "frontend/server.js"]
