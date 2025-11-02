import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginDto, RegisterDto } from '@/types/auth';
import { authService } from '@/services/auth.service';

interface AuthState {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Acciones
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initialize: () => void;
}

/**
 * Store de Zustand para la gestión del estado de autenticación
 * Utiliza persist middleware para guardar el estado en localStorage
 * 
 * Gestiona:
 * - Estado de autenticación y autorización de manera centralizada
 * - Usuario logueado
 * - Token JWT (mediante authService)
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get): AuthState => ({
      // Estado inicial
      user: null,
      isLoading: true,
      isAuthenticated: false,

      // Inicializar: verificar token y sincronizar estado
      initialize: () => {
        const storedUser = authService.getUser();
        const hasToken = authService.isAuthenticated();

        // Sincronizar estado con localStorage del token
        if (storedUser && hasToken) {
          set({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Si no hay token válido, limpiar estado
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Login: iniciar sesión y actualizar estado
      login: async (credentials: LoginDto) => {
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      // Register: registrar usuario y actualizar estado
      register: async (data: RegisterDto) => {
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      // Logout: cerrar sesión y limpiar estado
      logout: () => {
        authService.logout();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // RefreshUser: actualizar datos del usuario desde el servidor
      refreshUser: async () => {
        try {
          const profile = await authService.getProfile();
          localStorage.setItem('user', JSON.stringify(profile));
          set({
            user: profile,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error al actualizar perfil:', error);
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage', // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AuthState) => ({
        user: state.user, // Solo persistir el usuario, no el estado de carga o autenticación
      }),
      // Sincronizar estado de autenticación al rehidratar
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          // Verificar que el token aún existe después de la rehidratación
          const hasToken = authService.isAuthenticated();
          if (!hasToken && state.user) {
            // Si no hay token pero hay usuario, limpiar
            state.user = null;
            state.isAuthenticated = false;
          } else if (hasToken && state.user) {
            state.isAuthenticated = true;
          }
          state.isLoading = false;
        }
      },
    }
  )
);

