# ==========================================
# Dockerfile para @excepio/web (Next.js)
# ==========================================

# Stage 1: Base con dependencias
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Stage 2: Instalar dependencias
FROM base AS deps
# Copiar archivos de configuración del monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Stage 3: Build
FROM base AS builder
WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copiar código fuente
COPY packages/typescript-config ./packages/typescript-config
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web
COPY pnpm-workspace.yaml package.json ./

# Build del paquete shared primero
WORKDIR /app/packages/shared
RUN pnpm build

# Build de la aplicación web
WORKDIR /app/apps/web

# Configurar variables de entorno para el build
# NEXT_PUBLIC_API_URL se puede sobrescribir en runtime con docker-compose
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED=1
# Desactivar verificación TLS para entornos con certificados corporativos
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN pnpm build

# Stage 4: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar el output standalone completo (mantiene la estructura del monorepo)
COPY --from=builder /app/apps/web/.next/standalone ./

# Copiar archivos estáticos al lugar correcto dentro de la estructura standalone
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copiar mensajes de i18n al lugar donde la app los espera
COPY --from=builder /app/apps/web/messages ./apps/web/messages

# Cambiar propietario de los archivos
RUN chown -R nextjs:nodejs /app

# Cambiar al directorio donde está la app
WORKDIR /app/apps/web

USER nextjs

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Comando de inicio
CMD ["node", "server.js"]
