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
