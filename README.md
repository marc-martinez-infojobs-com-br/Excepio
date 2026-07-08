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

## Instalación

```bash
# Instalar dependencias
pnpm install
```

## Desarrollo

```bash
# Iniciar todos los servicios
pnpm -r dev

# O iniciar por separado:

# Terminal 1 - Backend (puerto 3000)
pnpm --filter @excepio/api dev

# Terminal 2 - Frontend (puerto 3001)
pnpm --filter @excepio/web dev
```

Una vez iniciados:
- Frontend: http://localhost:3001
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs

## Scripts disponibles

### Globales (desde la raíz)

```bash
pnpm -r dev          # Desarrollo
pnpm -r build        # Compilar todo
pnpm -r test         # Ejecutar tests
pnpm -r lint         # Linting
pnpm -r typecheck    # Verificar tipos
```

### API (@excepio/api)

```bash
pnpm --filter @excepio/api dev              # Desarrollo
pnpm --filter @excepio/api build            # Compilar
pnpm --filter @excepio/api test             # Todos los tests
pnpm --filter @excepio/api test:unit        # Tests unitarios
pnpm --filter @excepio/api test:integration # Tests de integración
pnpm --filter @excepio/api test:coverage    # Tests con cobertura
```

### Web (@excepio/web)

```bash
pnpm --filter @excepio/web dev              # Desarrollo
pnpm --filter @excepio/web build            # Compilar
pnpm --filter @excepio/web test             # Todos los tests
pnpm --filter @excepio/web test:unit        # Tests unitarios
pnpm --filter @excepio/web test:integration # Tests de integración
pnpm --filter @excepio/web test:coverage    # Tests con cobertura
```

### Base de datos (Prisma)

```bash
pnpm --filter @excepio/api exec prisma migrate dev  # Ejecutar migraciones
pnpm --filter @excepio/api exec prisma generate     # Generar cliente
pnpm --filter @excepio/api exec prisma studio       # Abrir Prisma Studio
```

## Estructura del proyecto

```
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   └── prisma/
│   └── web/                      # Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── providers/
│       ├── test/
│       │   ├── unit/
│       │   └── integration/
│       └── e2e/
├── packages/
│   ├── shared/                   # Tipos compartidos
│   ├── typescript-config/        # Configuración TypeScript
│   └── eslint-config/            # Configuración ESLint
└── package.json
```

## Variables de entorno

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/excepio?schema=public"
CORS_ORIGIN="http://localhost:3001"
NODE_ENV="development"
```

### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Documentación

- [Arquitectura](./docs/ARCHITECTURE.md)
- [Guía de contribución](./docs/CONTRIBUTING.md)
- [Modelo de datos](./docs/DATABASE.md)
- [Guía para agentes IA](./AGENTS.md)
