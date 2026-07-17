import { test as base, expect, Page } from '@playwright/test';

// Credenciales de test (del seed)
export const TEST_USER = {
  email: 'admin@excepio.com',
  password: 'Admin123!',
};

// Helper para hacer login
export async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('admin@excepio.com').fill(TEST_USER.email);
  await page.getByPlaceholder('••••••••').fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in|iniciar sesión|inicia sessió/i }).click();
  // Esperar redirección al dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

// Fixture personalizado con login automático
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
