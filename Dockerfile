FROM oven/bun:latest AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lock ./
COPY src/plesk/ ./src/
RUN bun install

FROM base AS prerelease
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV HOST="0.0.0.0"

RUN bun test
RUN bun --bun run build

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "--bun", "next", "start" ]