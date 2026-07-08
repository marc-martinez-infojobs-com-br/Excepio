# CONTRIBUTING.md – Guía de Desarrollo

Esta guía contiene los comandos, configuración y buenas prácticas para trabajar en el proyecto.

## Comandos

### Instalar dependencias

```bash
# En todos los paquetes
pnpm install

# Solo en web o api
pnpm --filter @excepio/web install <paquete>
pnpm --filter @excepio/api install <paquete>

# Todos los workspaces con filtro
pnpm -r install
```

### Desarrollo

```bash
# Iniciar todos los workspaces
pnpm -r dev

# Iniciar solo backend
pnpm --filter @excepio/api dev

# Iniciar solo frontend  
pnpm --filter @excepio/web dev
```

### Compilación y Despliegue

```bash
# Compilar todos
pnpm -r build

# Compilación de backend para producción con aislamiento
pnpm --filter @excepio/api deploy dist/

# Compilación de frontend para producción
pnpm --filter @excepio/web build
```

### Linting y Verificación de tipos

```bash
# Todos los paquetes
pnpm -r lint
pnpm -r typecheck
```

### Base de datos (Prisma)

```bash
# Ejecutar migraciones en desarrollo
pnpm --filter @excepio/api exec prisma migrate dev

# Generar cliente Prisma
pnpm --filter @excepio/api exec prisma generate

# Abrir Prisma Studio
pnpm --filter @excepio/api exec prisma studio
```

## Variables de Entorno

### Frontend (`apps/web/.env.local`)

| Variable | Descripción | Ejemplo Dev | Ejemplo Prod |
|----------|-------------|-------------|--------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API | `http://localhost:3000/api` | `https://api.example.com` |

> Las variables públicas de Next.js se acceden mediante `process.env.NEXT_PUBLIC_*` y deben prefijarse con `NEXT_PUBLIC_` para estar disponibles en el cliente.

### Backend (`apps/api/.env`)

| Variable | Descripción | Ejemplo Dev | Ejemplo Prod |
|----------|-------------|-------------|--------------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://user:pass@localhost:5432/db` | (producción) |
| `CORS_ORIGIN` | URL del Frontend para CORS | `http://localhost:5173` | `https://app.example.com` |
| `NODE_ENV` | Entorno de ejecución | `development` | `production` |

## Errores Comunes a Evitar

### 1. Importaciones directas entre apps
**Incorrecto:** Importar código de `@excepio/web` en la API o viceversa.  
**Correcto:** Usar peticiones HTTP. Los tipos compartidos van en `@excepio/shared`.

### 2. URLs de API hardcodeadas
**Incorrecto:** `axios.get('http://localhost:3000/api/...')`  
**Correcto:** `axios.get(\`${process.env.NEXT_PUBLIC_API_URL}/...\`)`

### 3. Instalación de paquetes sin filtro
**Incorrecto:** `cd apps/api && pnpm install axios`  
**Correcto:** `pnpm --filter @excepio/api install axios`

### 4. Olvidar migraciones de base de datos
Los cambios en `schema.prisma` requieren ejecutar migraciones antes de iniciar el servidor:
```bash
pnpm --filter @excepio/api exec prisma migrate dev
```

### 5. Swagger no configurado
El backend debe configurar explícitamente OpenAPI al iniciar en `main.ts`. No se genera automáticamente.

## Archivos de Referencia

| Propósito | Archivo |
|-----------|---------|
| Requisitos y arquitectura | `ARCHITECTURE.md` |
| Configuración monorepo | `pnpm-workspace.yaml` |
| Esquema de BD | `apps/api/prisma/schema.prisma` |
| Config Next.js | `apps/web/next.config.ts` |
| Cliente API | `apps/web/src/lib/api-client.ts` |
