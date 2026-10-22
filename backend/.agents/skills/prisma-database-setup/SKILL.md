---
name: prisma-database-setup
description: Guides for configuring Prisma 7 with PostgreSQL (driver adapter `@prisma/adapter-pg`). Use when setting up Prisma, configuring connection strings, or troubleshooting database connection issues. Triggers on "configure postgres", "prisma setup", "DATABASE_URL".
license: MIT
metadata:
  author: prisma
  version: "7.6.0"
---

# Prisma Database Setup

Guides for configuring Prisma ORM with PostgreSQL (other providers were removed from this template: the stack is PostgreSQL only).

## When to Apply

Reference this skill when:
- Initializing a new Prisma project
- Configuring connection strings and environment variables
- Troubleshooting database connection issues
- Setting up database-specific features
- Generating and instantiating Prisma Client

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Provider Guide | CRITICAL | `postgresql` |
| 2 | Client Setup | CRITICAL | `prisma-client-setup` |

## System Prerequisites

- **Node.js 20.19.0+**
- **TypeScript 5.4.0+**

## Bun Runtime

If you're using Bun, run Prisma CLI commands with `bunx --bun prisma ...` so Prisma uses the Bun runtime instead of falling back to Node.js.

## Configuration Files

1. **`prisma/schema.prisma`** for the schema.
2. **`prisma.config.ts`** for datasource URLs (Prisma 7).

## Driver Adapter

| Database | Adapter | JS Driver |
|----------|---------|-----------|
| PostgreSQL | `@prisma/adapter-pg` | `pg` |

```ts
import 'dotenv/config'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

## Prisma Client Setup (Required)

1. Install Prisma CLI and Prisma Client (in this monorepo, from the root with pnpm):
   ```bash
   pnpm add -E -D prisma --filter backend
   pnpm add -E @prisma/client @prisma/adapter-pg --filter backend
   ```

1. Add a generator block (`prisma-client` requires an explicit output path):
   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../generated"
   }
   ```

1. Generate Prisma Client: `pnpm db:generate`.

1. Re-run `prisma generate` after every schema change.

## Quick Reference

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client"
  output   = "../generated"
}
```

## Rule Files

```
references/postgresql.md
references/prisma-client-setup.md
```

## How to Use

Apply `references/postgresql.md`, then `references/prisma-client-setup.md` to complete client generation and adapter setup.
