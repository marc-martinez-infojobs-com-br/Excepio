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

5. **Path Aliases (Imports):** Usa siempre imports absolutos con path aliases. Nunca uses imports relativos (`../../`).

   **Backend API:**
   ```typescript
   // ✅ Correcto
   import { PrismaService } from '@app/prisma/prisma.service';
   import { PlatformService } from '@platform/platform.service';
   import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
   
   // ❌ Incorrecto
   import { PrismaService } from '../../../prisma/prisma.service';
   ```
   
   **Frontend Web:**
   ```typescript
   // ✅ Correcto
   import { useAuth } from '@hooks/use-auth';
   import { apiClient } from '@lib/api-client';
   import { Button } from '@components/ui/button';
   
   // ❌ Incorrecto
   import { useAuth } from '../../hooks/use-auth';
   import { useAuth } from '@/hooks/use-auth'; // Alias genérico obsoleto
   ```
   
   Ver tabla completa de aliases en `docs/ARCHITECTURE.md`.

## Referencias Rápidas

| Necesitas... | Consulta |
|--------------|----------|
| Stack y arquitectura | `docs/ARCHITECTURE.md` |
| Scripts y comandos | `docs/SCRIPTS.md` |
| Guía de contribución | `docs/CONTRIBUTING.md` |
| Modelo de datos | `docs/DATABASE.md` |
| Esquema de BD | `apps/api/prisma/schema.prisma` |
| Config monorepo | `pnpm-workspace.yaml` |

## Tests

### Tests Unitarios e Integración (Vitest)

- **API:** `pnpm --filter @excepio/api test`
- **Web:** `pnpm --filter @excepio/web test`

### Tests E2E (Playwright)

Los tests E2E requieren que API y Web estén corriendo:

```bash
# Levantar servicios (en terminales separadas)
pnpm --filter @excepio/api dev
pnpm --filter @excepio/web dev

# Ejecutar tests E2E
pnpm --filter @excepio/web test:e2e

# Otros comandos útiles
pnpm --filter @excepio/web test:e2e:ui      # Interfaz visual
pnpm --filter @excepio/web test:e2e:headed  # Ver navegador
pnpm --filter @excepio/web exec playwright show-report  # Ver reporte HTML
```

**Archivos E2E:**
| Archivo | Cobertura |
|---------|-----------|
| `test/e2e/auth.spec.ts` | Login, logout, protección de rutas |
| `test/e2e/dashboard.spec.ts` | Cards de stats, navegación |
| `test/e2e/issues.spec.ts` | Lista de excepciones, filtros, paginación |
| `test/e2e/issue-detail.spec.ts` | Detalle: header, stacktrace, metadata, occurrences |

**Credenciales de test (seed):** `admin@excepio.com` / `Admin123!`

## Internacionalización (i18n)

El frontend usa `next-intl` para internacionalización.

### Idiomas Soportados

- `ca` - Català (primer en el selector)
- `es` - Español (idioma por defecto)
- `en` - English

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `apps/web/src/i18n/config.ts` | Configuración de locales |
| `apps/web/src/i18n/request.ts` | getRequestConfig para server |
| `apps/web/messages/*.json` | Archivos de traducciones |
| `apps/web/src/components/language-selector.tsx` | Selector de idioma |

### Reglas para Traducciones

1. **Al agregar texto visible:** Añadir la key en TODOS los archivos de mensajes (`ca.json`, `es.json`, `en.json`)
2. **Usar `useTranslations`:** En componentes cliente usar `useTranslations('namespace')`
3. **Mantener consistencia:** Los tests de i18n verifican que todos los idiomas tienen las mismas keys
4. **Cookie de idioma:** El selector guarda el idioma en cookie `NEXT_LOCALE`

### Ejemplo de Uso

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MiComponente() {
  const t = useTranslations('exceptions');
  return <h1>{t('title')}</h1>;
}
```
