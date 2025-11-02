import { User } from '@/types/auth';

/**
 * Obtiene la ruta del dashboard según el rol del usuario
 * @param user - Usuario autenticado
 * @returns Ruta del dashboard apropiado
 */
export function getDashboardRoute(user: User | null): string {
  if (!user) {
    return '/auth/login';
  }
  
  return user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
}

