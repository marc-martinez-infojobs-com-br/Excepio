import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from '@i18n/config';

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/login', '/register'];

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/issues', '/platforms', '/users'];

/**
 * Obtiene el locale del request.
 * Prioridad: cookie NEXT_LOCALE > Accept-Language header > default
 */
function getLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang as Locale));
    
    if (preferredLocale) {
      return preferredLocale as Locale;
    }
  }

  // 3. Default
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de cookie (sincronizado con localStorage en el cliente)
  const token = request.cookies.get('excepio_token')?.value;
  
  // Obtener locale
  const locale = getLocale(request);
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Si no hay token y está intentando acceder a una ruta protegida
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token y está intentando acceder a login/register
  if (isPublicRoute && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Añadir locale al response header para que esté disponible en getRequestConfig
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
