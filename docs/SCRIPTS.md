# SCRIPTS.md – Comandos Disponibles

Este documento contiene todos los scripts disponibles en el proyecto.

## Base de Datos (Docker)

```bash
pnpm db:up         # Levantar PostgreSQL
pnpm db:down       # Detener PostgreSQL
pnpm db:reset      # Reset Docker (borra contenedor + volúmenes, BD vacía)
pnpm db:regenerate # Borrar BD + aplicar migraciones + seed (BD lista para usar)
```

## Desarrollo

### Globales (desde la raíz)

```bash
pnpm dev          # Desarrollo (todos los servicios)
pnpm build        # Compilar todo
pnpm test         # Ejecutar tests
pnpm lint         # Linting
pnpm typecheck    # Verificar tipos
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
pnpm --filter @excepio/web test:e2e         # Tests E2E (requiere API y Web corriendo)
pnpm --filter @excepio/web test:e2e:ui      # Tests E2E con interfaz visual
pnpm --filter @excepio/web test:e2e:headed  # Tests E2E con navegador visible
```

## Playwright (Tests E2E)

```bash
# Ejecutar tests E2E (requiere API y Web corriendo en localhost)
pnpm --filter @excepio/web test:e2e

# Interfaz visual interactiva
pnpm --filter @excepio/web test:e2e:ui

# Ver navegador durante ejecución
pnpm --filter @excepio/web test:e2e:headed

# Ver reporte HTML de la última ejecución
pnpm --filter @excepio/web exec playwright show-report

# Instalar navegadores de Playwright
pnpm --filter @excepio/web exec playwright install chromium
```

## Prisma (Base de datos)

```bash
# Migraciones y generación
pnpm --filter @excepio/api exec prisma migrate dev    # Aplicar migraciones pendientes
pnpm --filter @excepio/api exec prisma generate       # Regenerar cliente Prisma
pnpm --filter @excepio/api exec prisma studio         # Abrir Prisma Studio (GUI)

# Seed
pnpm --filter @excepio/api exec prisma db seed        # Ejecutar seed

# Reset y recreación
pnpm --filter @excepio/api exec prisma migrate reset --force  # Borrar BD + migraciones + seed
pnpm --filter @excepio/api exec prisma db push --force-reset  # Solo borrar BD (sin seed)
```

## Docker (Producción)

### Inicio Rápido

```bash
# Levantar toda la aplicación (PostgreSQL + API + Web)
docker compose -f docker-compose.prod.yml up -d

# Primera ejecución: descarga imágenes, ejecuta migraciones y seed automáticamente
# Ejecuciones posteriores: inicia directamente (idempotente)
```

### Gestión de Contenedores

```bash
# Ver estado de los servicios
docker compose -f docker-compose.prod.yml ps

# Ver logs de todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f postgres

# Detener todos los servicios
docker compose -f docker-compose.prod.yml down

# Detener y eliminar datos (reset completo)
docker compose -f docker-compose.prod.yml down -v

# Reiniciar un servicio específico
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart web
```

### Construcción de Imágenes (Desarrollo)

```bash
# Construir imagen de la API
docker build -t marcmartinezij/excepio-api:latest -f apps/api/Dockerfile .

# Construir imagen del Web
docker build -t marcmartinezij/excepio-web:latest -f apps/web/Dockerfile .

# Subir imágenes a DockerHub
docker push marcmartinezij/excepio-api:latest
docker push marcmartinezij/excepio-web:latest
```

### URLs de Acceso (Docker)

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/swagger |
