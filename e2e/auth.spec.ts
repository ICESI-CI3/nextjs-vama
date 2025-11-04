import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debería redirigir a login si no está autenticado', async ({ page }) => {
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('debería mostrar el formulario de login', async ({ page }) => {
    await page.goto('/auth/login');
    
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('debería tener enlace a registro', async ({ page }) => {
    await page.goto('/auth/login');
    
    const registerLink = page.getByRole('link', { name: /registrar/i });
    await expect(registerLink).toBeVisible();
  });

  test('debería navegar a página de registro', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByRole('link', { name: /registrar/i }).click();
    
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('debería mostrar formulario de registro completo', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.getByLabel(/nombre/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  });

  test('debería validar campos requeridos en login', async ({ page }) => {
    await page.goto('/auth/login');
    
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i });
    await loginButton.click();
    
    // El navegador debería mostrar validación HTML5
    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('debería validar formato de email', async ({ page }) => {
    await page.goto('/auth/login');
    
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('email-invalido');
    
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });
});

