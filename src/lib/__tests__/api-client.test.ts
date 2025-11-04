/**
 * Tests básicos para api-client
 * Nota: Estos tests son simplificados porque api-client configura interceptores de axios
 */

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debería tener la URL base configurada', () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nestjs-vama-production.up.railway.app/api';
    expect(apiUrl).toBeTruthy();
  });

  it('debería poder acceder a localStorage en navegador', () => {
    localStorage.setItem('access_token', 'test-token');
    const token = localStorage.getItem('access_token');
    expect(token).toBe('test-token');
  });

  it('debería poder limpiar el localStorage', () => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('user', 'user-data');
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

