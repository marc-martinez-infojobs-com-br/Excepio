# Excepio

Sistema de Registro y Consumo de Excepciones.

Monorepo con frontend (Next.js) y backend (NestJS) desplegados en servidores independientes.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js (App Router) + TypeScript + TanStack Query + Tailwind |
| Backend | NestJS + Prisma + PostgreSQL |
| Testing | Vitest + Testing Library + Playwright (E2E) |
| Monorepo | pnpm workspaces |

## Requisitos

- Node.js >= 20
- pnpm >= 9
- Docker (para PostgreSQL)

## Inicio Rápido

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
```

### 3. Levantar la base de datos

```bash
pnpm db:up
```

### 4. Ejecutar migraciones y seed

```bash
pnpm --filter @excepio/api exec prisma migrate dev
pnpm --filter @excepio/api exec prisma db seed
```

### 5. Iniciar el proyecto

```bash
pnpm dev
```

Una vez iniciados:
- Frontend: http://localhost:3001
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/swagger

## Estructura del Proyecto

```
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   └── prisma/               # Schema y migraciones
│   └── web/                      # Frontend Next.js
├── packages/
│   ├── shared/                   # Tipos y DTOs compartidos (Zod)
│   ├── typescript-config/
│   └── eslint-config/
├── docker-compose.yml
└── package.json
```

## Variables de Entorno

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://postgres:gzQFyXv95B2@Xe@localhost:5432/excepio?schema=public"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Scripts y comandos](./docs/SCRIPTS.md)
- [Guía de contribución](./docs/CONTRIBUTING.md)
- [Modelo de datos](./docs/DATABASE.md)
- [Guía para agentes IA](./AGENTS.md)
