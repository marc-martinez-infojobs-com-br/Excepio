import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test('should display dashboard with stats cards after login', async ({ authenticatedPage: page }) => {
    // Ya estamos autenticados y en /dashboard gracias al fixture
    await expect(page).toHaveURL(/\/dashboard/);

    // Verificar que existen las cards de estadísticas (usando clase de shadcn card)
    await expect(page.locator('.rounded-lg.border.bg-card').first()).toBeVisible();

    // Verificar que existe el DateRangePicker
    await expect(page.getByRole('button', { name: /7|días|days|últimos/i })).toBeVisible();
  });

  test('should display navigation sidebar', async ({ authenticatedPage: page }) => {
    // Verificar elementos del sidebar (usar exact para evitar ambigüedad)
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Incidencias', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Plataformas', exact: true })).toBeVisible();
  });

  test('should navigate to issues page from sidebar', async ({ authenticatedPage: page }) => {
    // Click en el enlace de Issues del sidebar (usar exact para evitar "Ver todas las incidencias")
    await page.getByRole('link', { name: 'Incidencias', exact: true }).click();

    // Verificar navegación
    await expect(page).toHaveURL(/\/issues/);
  });
});
