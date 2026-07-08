# ARCHITECTURE.md – Registro de Excepciones

## Visión General

Sistema de **Registro y Consumo de Excepciones** implementado como monorepo. El Frontend y Backend se despliegan en servidores independientes (ej. Web en Vercel, API en Railway/AWS).

**Restricción arquitectónica:** Toda comunicación Web → API es mediante peticiones HTTP. No hay importaciones directas entre apps.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Monorepo | pnpm workspaces |
| Frontend | Next.js (App Router) + TypeScript |
| Estado/Fetching | TanStack Query + Axios |
| Estilos | Tailwind CSS |
| Backend | NestJS (o Fastify + TypeScript) |
| Base de datos | PostgreSQL |
| ORM | Prisma (con soporte JSONB) |
| Documentación API | OpenAPI/Swagger en `/api/docs` |
| Testing | Vitest + Testing Library + Playwright (E2E) |

## Estrategia de Testing

| Nivel | Herramienta | Propósito |
|-------|-------------|-----------|
| Unitario | Vitest | Funciones, hooks, utilidades aisladas |
| Integración | Vitest + Testing Library | Componentes React, endpoints API |
| E2E | Playwright | Flujos completos usuario-sistema |

## Estructura del Proyecto

```
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   ├── test/
│   │   │   ├── unit/             # Tests unitarios (servicios, utils)
│   │   │   └── integration/      # Tests de integración (endpoints, DB)
│   │   ├── main.ts               # Punto de entrada (CORS + Swagger)
│   │   └── prisma/               # Esquema de base de datos
│   └── web/                      # Frontend Next.js (App Router)
│       ├── src/
│       │   ├── app/              # App Router (páginas, layouts, rutas)
│       │   ├── components/       # Componentes React
│       │   ├── lib/              # Utilidades y cliente API
│       │   └── providers/        # Providers (TanStack Query, etc.)
│       ├── test/
│       │   ├── unit/             # Tests unitarios (hooks, utils)
│       │   └── integration/      # Tests de integración (componentes)
│       ├── e2e/                  # Tests E2E con Playwright
│       └── next.config.ts
├── packages/
│   └── shared/                   # Tipos TypeScript compartidos (@excepio/shared)
├── pnpm-workspace.yaml
├── ARCHITECTURE.md               # Este archivo
├── AGENTS.md                     # Guía para agentes de IA
└── CONTRIBUTING.md               # Comandos y guía de desarrollo
```

## Requisitos Técnicos

### Frontend

- Configuración de `NEXT_PUBLIC_API_URL` para cambiar la URL de la API según el entorno
- Cliente HTTP centralizado usando Axios + TanStack Query
- Los tipos de request/response se importan de `@excepio/shared`
- App Router con Server y Client Components

### Backend

- Swagger/OpenAPI interactivo en `/api/docs`
- Middleware CORS habilitado y configurable por variable de entorno
- Payloads de errores almacenados en campos JSONB de PostgreSQL

### Tipos Compartidos

El paquete `@excepio/shared` contiene todos los tipos TypeScript de la API (DTOs, interfaces de request/response). Ambas apps lo importan para garantizar consistencia de tipos.
