import { test, expect } from './fixtures';

test.describe('Issues List', () => {
  test('should display issues table with data', async ({ authenticatedPage: page }) => {
    // Navegar a la página de issues
    await page.goto('/issues');
    await expect(page).toHaveURL(/\/issues/);

    // Esperar a que cargue la tabla (desktop view)
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Verificar que hay filas en la tabla (al menos una excepción del seed)
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should display filters section', async ({ authenticatedPage: page }) => {
    await page.goto('/issues');

    // Verificar que existen los filtros (platform, level, date)
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('should display pagination when there are results', async ({ authenticatedPage: page }) => {
    await page.goto('/issues');

    // Esperar a que cargue
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // Verificar que existe el contador de resultados (ej: "150 incidencias")
    await expect(page.locator('p.text-muted-foreground').filter({ hasText: /\d+.*incidencias|\d+.*issues/i })).toBeVisible();
  });

  test('should navigate to issue detail when clicking a row', async ({ authenticatedPage: page }) => {
    await page.goto('/issues');

    // Esperar a que cargue la tabla
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Click en la primera fila
    await page.locator('tbody tr').first().click();

    // Verificar que navega al detalle
    await expect(page).toHaveURL(/\/issues\/[a-zA-Z0-9-]+/);
  });
});
