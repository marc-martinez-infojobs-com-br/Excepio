# Excepio Web

Frontend de Excepio - Sistema de Registro de Excepciones.

## Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **Estado/Fetching:** TanStack Query + Axios
- **Internacionalización:** next-intl
- **Testing:** Vitest + Testing Library

## Desarrollo

```bash
# Desde la raíz del monorepo
pnpm dev

# Solo el frontend
pnpm --filter @excepio/web dev
```

El servidor de desarrollo se inicia en http://localhost:3001

## Estructura del Proyecto

```
src/
├── app/                    # App Router (páginas y layouts)
│   ├── (auth)/            # Rutas de autenticación (login, register)
│   ├── (dashboard)/       # Rutas protegidas (dashboard, exceptions)
│   └── layout.tsx         # Layout raíz con providers
├── components/            # Componentes React
│   ├── auth/              # Formularios de auth
│   ├── exceptions/        # Listado, filtros, paginación
│   ├── theme/             # Toggle de tema, logo, avatar
│   ├── ui/                # Componentes shadcn/ui
│   └── language-selector.tsx
├── hooks/                 # Custom hooks (useAuth, etc.)
├── i18n/                  # Configuración de internacionalización
│   ├── config.ts          # Locales soportados
│   └── request.ts         # getRequestConfig
├── lib/                   # Utilidades (api-client, utils)
└── providers/             # Providers de contexto
messages/                  # Archivos de traducción
├── ca.json                # Català
├── es.json                # Español
└── en.json                # English
```

## Internacionalización

La aplicación soporta tres idiomas:

| Código | Idioma | Estado |
|--------|--------|--------|
| `ca` | Català | ✓ |
| `es` | Español | ✓ (por defecto) |
| `en` | English | ✓ |

### Cambiar idioma

El usuario puede cambiar el idioma usando el selector de idioma (icono de globo) en la cabecera.

### Agregar traducciones

1. Añadir la key en los tres archivos: `messages/ca.json`, `messages/es.json`, `messages/en.json`
2. Usar `useTranslations('namespace')` en el componente
3. Los tests verifican que todos los idiomas tienen las mismas keys

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('exceptions');
  return <h1>{t('title')}</h1>;
}
```

## Testing

```bash
# Ejecutar tests
pnpm --filter @excepio/web test

# Con watch mode
pnpm --filter @excepio/web test:watch

# Con coverage
pnpm --filter @excepio/web test:coverage
```

## Build

```bash
pnpm --filter @excepio/web build
```

## Variables de Entorno

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```
