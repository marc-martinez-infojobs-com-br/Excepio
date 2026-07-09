# SCRIPTS.md – Comandos Disponibles

Este documento contiene todos los scripts disponibles en el proyecto.

## Base de Datos (Docker)

```bash
pnpm db:up      # Levantar PostgreSQL
pnpm db:down    # Detener PostgreSQL
pnpm db:reset   # Reset completo (borra todos los datos)
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
```

## Prisma (Base de datos)

```bash
pnpm --filter @excepio/api exec prisma migrate dev    # Ejecutar migraciones
pnpm --filter @excepio/api exec prisma db seed        # Ejecutar seed
pnpm --filter @excepio/api exec prisma generate       # Generar cliente
pnpm --filter @excepio/api exec prisma studio         # Abrir Prisma Studio (GUI)
```
