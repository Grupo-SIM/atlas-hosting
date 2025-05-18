FROM oven/bun:1 AS base

USER root
RUN apk update && apk add --no-cache libc6-compat

USER bun
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock plesk /temp/dev/
RUN cd /temp/dev && bun install

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
ENV HOST="0.0.0.0"
RUN bun test
RUN bun --bun run build

FROM base AS release

COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.js" ]