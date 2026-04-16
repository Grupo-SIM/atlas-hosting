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

# Variáveis de ambiente de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Executa o build otimizado (usa o modo standalone configurado no next.config.js)
RUN bun --bun run build

# Estágio 3: Runner de produção (Imagem final leve)
FROM oven/bun:latest AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Copia apenas o necessário para rodar a aplicação (Modo Standalone)
# Isso reduz o tamanho da imagem em até 80-90%
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next/standalone ./
COPY --from=builder /usr/src/app/.next/static ./.next/static

# Garante que o usuário bun tenha permissões (opcional, mas recomendado por segurança)
USER bun

EXPOSE 3000

# No modo standalone, o ponto de entrada é o server.js gerado pelo Next.js
# Usamos o Bun para rodar o servidor de forma ultra rápida
ENTRYPOINT ["bun", "--bun", "server.js"]