import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';

// Mock del authStore
jest.mock('@/stores/authStore');
const mockedUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar el estado del store', () => {
    const mockStore = {
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'player' as const, total_score: 0 },
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      initialize: jest.fn(),
    };

    mockedUseAuthStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockStore.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('debería tener acceso a las acciones del store', () => {
    const mockStore = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      initialize: jest.fn(),
    };

    mockedUseAuthStore.mockReturnValue(mockStore);

    const { result } = renderHook(() => useAuth());

    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
    expect(result.current.register).toBeDefined();
  });
});

