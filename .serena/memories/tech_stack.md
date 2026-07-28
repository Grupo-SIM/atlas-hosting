# Tech Stack

- TypeScript + Next.js 16, React 19.
- PostgreSQL schema uses Drizzle ORM; `drizzle.config.ts` loads `src/lib/db/schema/index.ts` and targets `./drizzle`.
- Bun is pinned as package manager (`bun@1.2.17`).