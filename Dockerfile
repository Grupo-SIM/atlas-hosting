# Estágio 1: Instalação de dependências
FROM oven/bun:latest AS deps
WORKDIR /usr/src/app

# Copia arquivos de definição de pacotes
COPY package.json bun.lock ./

# Instala as dependências usando o cache do Bun de forma eficiente
RUN bun install --frozen-lockfile

# Estágio 2: Build da aplicação
FROM oven/bun:latest AS builder
WORKDIR /usr/src/app

# Copia as dependências do estágio anterior
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Marca o instante deste build (invalida com COPY . . acima, então muda a cada build real)
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > BUILD_TIME

# Variáveis de ambiente de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build otimizado (usa o modo standalone configurado no next.config.js)
RUN bun run build

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

# Copia apenas o necessário para rodar a aplicação (Modo Standalone)
# O standalone do Next.js contém apenas os arquivos necessários para rodar sem node_modules gigantes
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static
COPY --from=builder /usr/src/app/BUILD_TIME ./BUILD_TIME

EXPOSE 3000

# No modo standalone, o ponto de entrada é o server.js
# Usamos Node aqui para garantir 100% de compatibilidade com o servidor standalone do Next
CMD ["node", "server.js"]