import { test, expect } from './fixtures';

test.describe('Issue Detail', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    // Navegar al detalle desde la lista para tener un ID válido
    await page.goto('/issues');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/issues\/[a-zA-Z0-9-]+/);
  });

  test('should display exception header with severity and time', async ({ authenticatedPage: page }) => {
    // Verificar que existe el header con badge de severidad (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    await expect(page.locator('span').filter({ hasText: /^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$/ }).first()).toBeVisible();

    // Verificar que existe el mensaje de la excepción (h1)
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should display stack trace section', async ({ authenticatedPage: page }) => {
    // Verificar que existe la sección de stack trace
    await expect(page.getByText(/stack trace/i)).toBeVisible();

    // Verificar que hay contenido de código (pre o code block)
    await expect(page.locator('pre, code').first()).toBeVisible();
  });

  test('should display context section', async ({ authenticatedPage: page }) => {
    // Verificar que existe la sección de contexto
    await expect(page.getByText(/context|contexto/i).first()).toBeVisible();
  });

  test('should display occurrences table', async ({ authenticatedPage: page }) => {
    // Verificar que existe la tabla de ocurrencias
    await expect(page.getByText(/occurrences|ocurrencias/i).first()).toBeVisible();

    // Verificar que hay una tabla
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('should have back button that navigates to issues list', async ({ authenticatedPage: page }) => {
    // Buscar y hacer click en el botón de volver
    const backButton = page.getByRole('button', { name: /back|volver|tornar/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Verificar que vuelve a la lista
    await expect(page).toHaveURL(/\/issues$/);
  });
});
