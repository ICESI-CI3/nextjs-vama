import { getDashboardRoute } from '../utils';
import { User } from '@/types/auth';

describe('Utils', () => {
  describe('getDashboardRoute', () => {
    it('debería retornar dashboard de admin para usuarios admin', () => {
      const adminUser: User = {
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
        total_score: 0,
      };

      const route = getDashboardRoute(adminUser);
      expect(route).toBe('/admin/dashboard');
    });

    it('debería retornar dashboard normal para usuarios player', () => {
      const playerUser: User = {
        id: '2',
        name: 'Player',
        email: 'player@test.com',
        role: 'player',
        total_score: 100,
      };

      const route = getDashboardRoute(playerUser);
      expect(route).toBe('/dashboard');
    });

    it('debería retornar login si no hay usuario', () => {
      const route = getDashboardRoute(null);
      expect(route).toBe('/auth/login');
    });
  });
});

