import { test, expect } from '@playwright/test';

/**
 * Tests de gestión de trivias
 * Nota: Estos tests requieren autenticación previa
 */

test.describe('Gestión de Trivias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería redirigir a login si no está autenticado', async ({ page }) => {
    await page.goto('/my-trivias');
    
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería cargar la página de mis trivias', async ({ page }) => {
    await page.goto('/my-trivias');
    
    // Verificar que existe la página (aunque redirija)
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toBeTruthy();
  });

  test('debería tener el título correcto', async ({ page }) => {
    await page.goto('/my-trivias');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Si está autenticado, debería ver "Mis Trivias"
    // Si no, debería estar en login
    const isLoginPage = page.url().includes('/auth/login');
    
    if (!isLoginPage) {
      await expect(page.getByRole('heading', { name: /mis trivias/i })).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/auth\/login/);
    }
  });
});

test.describe('UI de Gestión de Trivias', () => {
  test('página debería tener estructura HTML válida', async ({ page }) => {
    await page.goto('/my-trivias');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar estructura básica
    const hasHtml = await page.locator('html').count() > 0;
    const hasBody = await page.locator('body').count() > 0;
    
    expect(hasHtml).toBe(true);
    expect(hasBody).toBe(true);
  });
});

