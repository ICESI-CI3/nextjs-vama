import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test('debería cargar la página principal', async ({ page }) => {
    await page.goto('/');
    
    // La página principal debería existir y cargar
    await expect(page).toHaveTitle(/TriviaTime/);
  });

  test('debería redirigir rutas protegidas a login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Debería redirigir a login
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería redirigir /play a login si no autenticado', async ({ page }) => {
    await page.goto('/play');
    
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería redirigir /my-trivias a login si no autenticado', async ({ page }) => {
    await page.goto('/my-trivias');
    
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería redirigir /rankings a login si no autenticado', async ({ page }) => {
    await page.goto('/rankings');
    
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería poder acceder a página de registro sin autenticación', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page).toHaveURL(/\/auth\/register/);
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
  });

  test('debería poder navegar entre login y registro', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Ir a registro
    await page.getByRole('link', { name: /registrar/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
    
    // Volver a login
    await page.getByRole('link', { name: /iniciar sesión/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

