<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Internacionalización (i18n)

Este proyecto usa `next-intl` para soporte multiidioma.

### Idiomas

- `ca` - Català (primero en el selector)
- `es` - Español (por defecto)
- `en` - English

### Archivos importantes

| Archivo | Propósito |
|---------|-----------|
| `src/i18n/config.ts` | Array de locales y defaultLocale |
| `src/i18n/request.ts` | getRequestConfig para cargar mensajes |
| `messages/ca.json` | Traducciones en catalán |
| `messages/es.json` | Traducciones en español |
| `messages/en.json` | Traducciones en inglés |
| `src/components/language-selector.tsx` | Selector de idioma con iconos SVG |

### Reglas para agentes

1. **Al agregar texto visible:** Añadir la key en los 3 archivos de mensajes
2. **En componentes cliente:** Usar `useTranslations('namespace')`
3. **Cookie:** El idioma se guarda en cookie `NEXT_LOCALE`
4. **Tests:** Los tests de `messages.spec.ts` verifican consistencia entre idiomas

### Ejemplo

```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MiComponente() {
  const t = useTranslations('exceptions');
  return <h1>{t('title')}</h1>;
}
```
