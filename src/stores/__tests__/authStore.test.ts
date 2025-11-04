import { useAuthStore } from '../authStore';
import { authService } from '@/services/auth.service';

// Mock del authService
jest.mock('@/services/auth.service');
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('AuthStore', () => {
  beforeEach(() => {
    // Limpiar el store y mocks antes de cada test
    localStorage.clear();
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  describe('Estado inicial', () => {
    it('debería tener el estado inicial correcto', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('initialize', () => {
    it('debería inicializar con usuario si hay token válido', () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: 'player' as const,
        total_score: 0,
      };

      mockedAuthService.getUser.mockReturnValue(mockUser);
      mockedAuthService.isAuthenticated.mockReturnValue(true);

      const { initialize } = useAuthStore.getState();
      initialize();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('debería limpiar estado si no hay token válido', () => {
      mockedAuthService.getUser.mockReturnValue(null);
      mockedAuthService.isAuthenticated.mockReturnValue(false);

      const { initialize } = useAuthStore.getState();
      initialize();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('debería actualizar estado al hacer login exitoso', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        role: 'player' as const,
        total_score: 0,
      };

      mockedAuthService.login.mockResolvedValue({
        user: mockUser,
        access_token: 'token',
      });

      const { login } = useAuthStore.getState();
      await login({ email: 'test@test.com', password: 'password' });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('debería limpiar estado si el login falla', async () => {
      mockedAuthService.login.mockRejectedValue(new Error('Login failed'));

      const { login } = useAuthStore.getState();

      await expect(
        login({ email: 'wrong@test.com', password: 'wrong' })
      ).rejects.toThrow('Login failed');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('debería limpiar el estado al cerrar sesión', () => {
      // Establecer un estado autenticado
      useAuthStore.setState({
        user: {
          id: '1',
          name: 'Test',
          email: 'test@test.com',
          role: 'player',
          total_score: 0,
        },
        isAuthenticated: true,
        isLoading: false,
      });

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(mockedAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('debería actualizar estado al registrarse exitosamente', async () => {
      const mockUser = {
        id: '2',
        name: 'New User',
        email: 'new@test.com',
        role: 'player' as const,
        total_score: 0,
      };

      mockedAuthService.register.mockResolvedValue({
        user: mockUser,
        access_token: 'new-token',
      });

      const { register } = useAuthStore.getState();
      await register({ name: 'New User', email: 'new@test.com', password: 'password' });

      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('New User');
      expect(state.isAuthenticated).toBe(true);
    });
  });
});

