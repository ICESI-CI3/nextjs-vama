import { authService } from '../auth.service';
import apiClient from '@/lib/api-client';

// Mock del api-client
jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  beforeEach(() => {
    // Limpiar mocks y localStorage antes de cada test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('debería guardar token y usuario en localStorage al hacer login', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'player', total_score: 0 },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(localStorage.getItem('access_token')).toBe('test-token');
      expect(localStorage.getItem('user')).toContain('Test User');
      expect(result).toEqual(mockResponse.data);
    });

    it('debería llamar al endpoint correcto', async () => {
      const mockResponse = {
        data: { access_token: 'token', user: {} },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      await authService.login({ email: 'test@test.com', password: 'password' });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password',
      });
    });
  });

  describe('register', () => {
    it('debería guardar token y usuario en localStorage al registrarse', async () => {
      const mockResponse = {
        data: {
          access_token: 'new-token',
          user: { id: '2', name: 'New User', email: 'new@test.com', role: 'player', total_score: 0 },
        },
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'password',
      });

      expect(localStorage.getItem('access_token')).toBe('new-token');
      expect(result.user.name).toBe('New User');
    });
  });

  describe('logout', () => {
    it('debería limpiar localStorage al cerrar sesión', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', '{"name": "Test"}');

      authService.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('debería retornar el token almacenado', () => {
      localStorage.setItem('access_token', 'my-token');

      const token = authService.getToken();

      expect(token).toBe('my-token');
    });

    it('debería retornar null si no hay token', () => {
      const token = authService.getToken();
      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('debería retornar true si hay token', () => {
      localStorage.setItem('access_token', 'token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('debería retornar false si no hay token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getUser', () => {
    it('debería retornar el usuario almacenado', () => {
      const user = { id: '1', name: 'Test User', email: 'test@test.com', role: 'player' as const, total_score: 0 };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getUser();

      expect(result).toEqual(user);
    });

    it('debería retornar null si no hay usuario', () => {
      const result = authService.getUser();
      expect(result).toBeNull();
    });
  });
});

