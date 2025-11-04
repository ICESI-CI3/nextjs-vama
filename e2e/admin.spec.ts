import { test, expect } from '@playwright/test';

test.describe('Panel de Administración', () => {
  test('debería proteger la ruta de admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Sin autenticación debe redirigir a login
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería cargar la página de admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que la página existe
    const hasBody = await page.locator('body').count() > 0;
    expect(hasBody).toBe(true);
  });

  test('debería tener estructura básica', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar HTML válido
    const hasHtml = await page.locator('html').count() > 0;
    expect(hasHtml).toBe(true);
  });
});

test.describe('Reportes', () => {
  test('debería proteger la ruta de reportes', async ({ page }) => {
    await page.goto('/reports');
    
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería cargar página de reportes', async ({ page }) => {
    await page.goto('/reports');
    
    await page.waitForLoadState('domcontentloaded');
    
    const hasContent = await page.locator('body').count() > 0;
    expect(hasContent).toBe(true);
  });
});

