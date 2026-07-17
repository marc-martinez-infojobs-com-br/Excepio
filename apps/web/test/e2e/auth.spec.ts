import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures';

test.describe('Authentication', () => {
  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/login');

    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/\/login/);

    // Rellenar el formulario
    await page.getByPlaceholder('admin@excepio.com').fill(TEST_USER.email);
    await page.getByPlaceholder('••••••••').fill(TEST_USER.password);

    // Click en el botón de submit
    await page.getByRole('button', { name: /iniciar sesión|sign in|inicia sessió/i }).click();

    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Rellenar con credenciales incorrectas
    await page.getByPlaceholder('admin@excepio.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');

    // Click en submit
    await page.getByRole('button', { name: /iniciar sesión|sign in|inicia sessió/i }).click();

    // Verificar que aparece un mensaje de error en el formulario (clase text-destructive)
    await expect(page.locator('.text-destructive')).toBeVisible({ timeout: 5000 });

    // Verificar que seguimos en login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Intentar acceder al dashboard sin autenticación
    await page.goto('/dashboard');

    // Debería redirigir a login
    await expect(page).toHaveURL(/\/login/);
  });
});
