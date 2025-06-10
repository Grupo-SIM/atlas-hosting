FROM oven/bun:latest AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install

COPY . .

ENV NODE_ENV=production
ENV HOST="0.0.0.0"

RUN bun --bun run build

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "--bun", "start" ]