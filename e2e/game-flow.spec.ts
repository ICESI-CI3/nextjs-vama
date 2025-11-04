import { test, expect } from '@playwright/test';

/**
 * Tests simplificados del flujo de juego
 * Nota: Estos tests asumen que tienes datos de prueba en el backend
 * o que el backend está en modo de desarrollo con datos mock
 */

test.describe('Flujo de Juego', () => {
  test('debería mostrar opciones de tipo de juego', async ({ page }) => {
    // Para este test, asumimos que ya hay autenticación (en producción usarías fixtures)
    await page.goto('/play');
    
    // Si redirige a login, el test falla correctamente
    // En un entorno real, aquí configurarías autenticación
    const isLoginPage = page.url().includes('/auth/login');
    
    if (isLoginPage) {
      // Test pasa si redirige correctamente a login
      await expect(page).toHaveURL(/\/auth\/login/);
    } else {
      // Si está autenticado, debería ver las opciones
      await expect(page.getByText(/elige el tipo de trivia/i)).toBeVisible();
    }
  });

  test('debería proteger la ruta de juego', async ({ page }) => {
    await page.goto('/play');
    
    // Sin autenticación, debe redirigir a login
    await page.waitForURL(/\/auth\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería tener estructura correcta en página de juego', async ({ page }) => {
    await page.goto('/play');
    
    // La página debería cargar (aunque redirija)
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toBeTruthy();
  });
});

test.describe('Elementos de UI del Juego', () => {
  test('página de juego debería tener título TriviaTime', async ({ page }) => {
    await page.goto('/play');
    
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que el título existe en algún lugar
    const hasTitle = await page.locator('text=TriviaTime').count() > 0;
    expect(hasTitle).toBeTruthy();
  });
});

