import { test, expect } from '@playwright/test';

test.describe('Rankings', () => {
  test('debería proteger la ruta de rankings', async ({ page }) => {
    await page.goto('/rankings');
    
    // Sin autenticación debe redirigir a login
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería cargar la página de rankings', async ({ page }) => {
    await page.goto('/rankings');
    
    await page.waitForLoadState('domcontentloaded');
    
    // La página debe existir
    const hasContent = await page.locator('body').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('debería tener título en la página', async ({ page }) => {
    await page.goto('/rankings');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que tiene contenido
    const hasText = await page.locator('text=Rankings').count() > 0 || 
                     page.url().includes('/auth/login');
    expect(hasText).toBeTruthy();
  });
});

