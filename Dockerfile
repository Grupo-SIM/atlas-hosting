FROM oven/bun AS base

USER root
RUN apk update && apk add --no-cache libc6-compat

WORKDIR /usr/src/app

RUN mkdir -p /temp/prod
COPY package.json bun.lock plesk /temp/prod/
RUN cd /temp/prod && bun install

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
ENV HOST="0.0.0.0"
RUN bun test
RUN bun --bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "server.js" ]