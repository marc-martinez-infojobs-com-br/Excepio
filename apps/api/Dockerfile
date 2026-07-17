# ==========================================
# Dockerfile para @excepio/api (NestJS)
# ==========================================

# Stage 1: Base con dependencias
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Stage 2: Instalar dependencias y Build
FROM base AS builder
WORKDIR /app

# Copiar archivos de configuración del monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Build del paquete shared primero
WORKDIR /app/packages/shared
RUN pnpm build

# Build de la API
WORKDIR /app/apps/api
# Generar Prisma Client antes de compilar (DATABASE_URL dummy solo para generación)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner

# Instalar pnpm para poder ejecutar comandos prisma
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Instalar TypeScript y ts-node globalmente para ejecutar seed
RUN npm install -g typescript ts-node

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copiar estructura completa del monorepo necesaria
# Esto incluye node_modules con toda la estructura de pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

# Copiar archivos de configuración
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./

# Copiar dist de shared
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copiar la API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copiar config de Prisma para producción (usa process.cwd() en vez de __dirname)
COPY apps/api/prisma.config.prod.js ./apps/api/prisma.config.js

# Copiar script de entrypoint y check-users
COPY apps/api/scripts/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
COPY apps/api/scripts/check-users.js ./apps/api/scripts/
RUN chmod +x ./apps/api/docker-entrypoint.sh

# Cambiar propietario de los archivos
RUN chown -R nestjs:nodejs /app

# Cambiar al directorio de la app
WORKDIR /app/apps/api

USER nestjs

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check (start-period más largo para permitir migraciones)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Usar entrypoint para verificar BD antes de iniciar
ENTRYPOINT ["./docker-entrypoint.sh"]
