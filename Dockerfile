FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
# This stage is dedicated to installing dependencies
COPY package.json bun.lock ./
# If the 'plesk' directory contains files needed for 'bun install' (e.g., private package sources, C++ addons configurations), copy it.
# If 'plesk' is only needed for runtime or other build steps, copy it in a later stage.
# Assuming 'plesk' might be needed for install or is small enough to not worry about stage optimization here.
COPY plesk ./plesk
RUN bun install

FROM base AS prerelease
# Copy only the installed dependencies from the 'install' stage
COPY --from=install /usr/src/app/node_modules ./node_modules
# Copy the rest of your application code
COPY . .

ENV NODE_ENV=production
ENV HOST="0.0.0.0"
RUN bun test
RUN bun run build # This uses the 'build' script from your package.json

FROM base AS release
COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static
# If you have a 'public' folder for static assets, copy it too:
# COPY --from=prerelease /usr/src/app/public ./public

USER bun
EXPOSE 3000/tcp
# Ensure your 'server.js' is correctly referenced by the build output (e.g., standalone mode)
# If using default Next.js start, it might be different.
# For standalone output, server.js is typical.
ENTRYPOINT [ "bun", "run", "server.js" ]