import apiClient from '@/lib/api-client';
import { LoginDto, RegisterDto, LoginResponse, RegisterResponse, User } from '@/types/auth';

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Guardar token y usuario en localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    
    // Guardar token y usuario en localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Obtener token almacenado
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener usuario almacenado
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Obtener perfil del usuario desde el servidor
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  }
}

export const authService = new AuthService();

