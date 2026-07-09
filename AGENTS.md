# AGENTS.md – Guía para Agentes de IA

Este archivo contiene instrucciones operativas para agentes de IA que trabajan en el proyecto.

> **Documentación relacionada:**
> - Arquitectura y stack: `docs/ARCHITECTURE.md`
> - Scripts y comandos: `docs/SCRIPTS.md`
> - Guía de contribución: `docs/CONTRIBUTING.md`
> - Modelo de datos: `docs/DATABASE.md`

## Modo de Trabajo

### Rol del Desarrollador
- Proporciona los **requisitos** de lo que necesita
- Ejecuta y verifica que el código funciona
- Decide cuándo continuar

### Rol del Agente (tú)
- **NO generes código que no se te pida**
- Cuando se pida un **TEST**, genera **SOLO** el test
- Cuando se pida la **IMPLEMENTACIÓN**, genera **SOLO** la implementación
- Sigue las convenciones del proyecto (TDD, estructura de carpetas, etc.)
- **Si algo no está claro, pregunta antes de generar**

### TDD (Test-Driven Development)
1. Siempre escribir el test **PRIMERO**
2. Verificar que **FALLA** (Red)
3. Implementar código **MÍNIMO** para pasar (Green)
4. Refactorizar si es necesario

## Contexto del Proyecto

Monorepo de Registro de Excepciones con Frontend y Backend desplegados en servidores separados.

**Regla crítica:** La comunicación Web → API es siempre mediante HTTP. Nunca importes código directamente entre `@excepio/web` y `@excepio/api`.

## Puntos de Integración Clave

### Cliente API en Web

La instancia de Axios debe:
- Usar `process.env.NEXT_PUBLIC_API_URL` como URL base
- Integrarse con TanStack Query para caché y refetching
- Ubicarse en `apps/web/src/lib/api-client.ts`
- Usarse solo en Client Components (con `'use client'`)

### Punto de entrada del Backend (main.ts)

Debe configurar:
- Middleware CORS con `process.env.CORS_ORIGIN`
- Swagger/OpenAPI en `/api/swagger`

### Tipos Compartidos

Todos los tipos de request/response viven en `packages/shared/` e importados por frontend y backend.

## Reglas para Agentes

1. **Antes de cualquier cambio de schema Prisma:** Ejecuta migraciones con `pnpm --filter @excepio/api exec prisma migrate dev`

2. **Al instalar dependencias:** Usa siempre el filtro desde la raíz del proyecto:
   ```bash
   pnpm --filter @excepio/api install <paquete>
   pnpm --filter @excepio/web install <paquete>
   ```

3. **URLs de API:** Nunca hardcodees URLs. Usa siempre `process.env.NEXT_PUBLIC_API_URL` en el frontend.

4. **Swagger:** Debe configurarse explícitamente en `main.ts`. No se genera automáticamente.

## Referencias Rápidas

| Necesitas... | Consulta |
|--------------|----------|
| Stack y arquitectura | `docs/ARCHITECTURE.md` |
| Scripts y comandos | `docs/SCRIPTS.md` |
| Guía de contribución | `docs/CONTRIBUTING.md` |
| Modelo de datos | `docs/DATABASE.md` |
| Esquema de BD | `apps/api/prisma/schema.prisma` |
| Config monorepo | `pnpm-workspace.yaml` |
