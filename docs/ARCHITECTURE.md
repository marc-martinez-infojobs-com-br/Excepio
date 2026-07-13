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
| Documentación API | OpenAPI/Swagger en `/api/swagger` |
| Testing | Vitest + Testing Library + Playwright (E2E) |
| Autenticación | JWT (Passport.js) + bcrypt |

## Autenticación y Autorización

### Dos Sistemas de Autenticación

El sistema implementa dos mecanismos de autenticación independientes:

#### 1. JWT (JSON Web Tokens) - Para Usuarios Humanos

**Propósito:** Autenticar usuarios que acceden a la plataforma web para gestionar y visualizar excepciones.

- **Método:** Email + Password con tokens JWT
- **Librería:** `@nestjs/jwt` + `passport-jwt`
- **Hash de contraseñas:** bcrypt
- **Endpoints:**
  - `POST /auth/register` - Registro de nuevos usuarios
  - `POST /auth/login` - Login (retorna JWT)
  - `GET /auth/profile` - Obtener perfil del usuario autenticado
- **Protección:** Los endpoints de gestión (CRUD de usuarios, proyectos, etc.) están protegidos por `JwtAuthGuard`

#### 2. API Key - Para Proyectos/Aplicaciones

**Propósito:** Autenticar aplicaciones que reportan excepciones al sistema.

- **Método:** API Key única por proyecto
- **Campo:** `Project.apiKey` (generado automáticamente al crear un proyecto)
- **Endpoints protegidos:**
  - `POST /exceptions` - Reportar una excepción (futura implementación)
- **Protección:** Los endpoints de ingesta usan un guard que valida el API Key

### Roles de Usuario

El sistema implementa control de acceso basado en roles (RBAC):

| Rol | Permisos |
|-----|----------|
| **ADMINISTRADOR** | CRUD completo de usuarios, proyectos y excepciones. Acceso total al sistema. |
| **USUARIO** | Solo lectura de excepciones y proyectos. No puede gestionar usuarios. |

**Implementación:**
- Enum `UserRole` en Prisma y DTOs compartidos
- `RolesGuard` para proteger endpoints según rol requerido
- Decorador `@Roles()` para especificar roles permitidos

### Flujo de Autenticación JWT

```
1. Usuario → POST /auth/login { email, password }
2. Backend valida credenciales con bcrypt
3. Backend genera JWT firmado con datos del usuario
4. Usuario recibe { access_token, user }
5. Frontend almacena token (memoria/localStorage/cookie)
6. Frontend envía token en header: Authorization: Bearer <token>
7. Backend valida token con JwtStrategy en cada request
```

### Seguridad

- Las contraseñas nunca se almacenan en texto plano (bcrypt con salt)
- Los tokens JWT expiran según configuración (ej. 24h)
- Los usuarios pueden ser desactivados mediante `statusId` (borrado lógico)
- Sin relación User-Project por ahora (cualquier usuario autenticado puede ver todo)

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

- Swagger/OpenAPI interactivo en `/api/swagger`
- Middleware CORS habilitado y configurable por variable de entorno
- Payloads de errores almacenados en campos JSONB de PostgreSQL
- Autenticación JWT con Passport.js para usuarios web
- Guards para protección de endpoints (JwtAuthGuard, RolesGuard)
- API Keys para autenticación de proyectos que reportan excepciones

### Tipos Compartidos

El paquete `@excepio/shared` contiene todos los tipos TypeScript de la API (DTOs, interfaces de request/response). Ambas apps lo importan para garantizar consistencia de tipos.
