import { usersService } from '../users.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('UsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('debería obtener todos los usuarios', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@test.com', role: 'player' as const, total_score: 100 },
        { id: '2', name: 'User 2', email: 'user2@test.com', role: 'admin' as const, total_score: 200 },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockUsers });

      const result = await usersService.getUsers();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });


  describe('updateUser', () => {
    it('debería actualizar un usuario', async () => {
      const updates = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };

      const mockResponse = {
        data: {
          id: 'user-1',
          role: 'player' as const,
          total_score: 100,
          ...updates,
        },
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      const result = await usersService.updateUser('user-1', updates);

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/users/user-1', updates);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario', async () => {
      mockedApiClient.delete.mockResolvedValue({});

      await usersService.deleteUser('user-1');

      expect(mockedApiClient.delete).toHaveBeenCalledWith('/users/user-1');
    });
  });

  describe('changeUserRole', () => {
    it('debería cambiar el rol de un usuario', async () => {
      const mockResponse = {
        data: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@test.com',
          role: 'admin' as const,
          total_score: 100,
        },
      };

      mockedApiClient.patch.mockResolvedValue(mockResponse);

      const result = await usersService.changeUserRole('user-1', { role: 'admin' });

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/users/user-1/change-role', { role: 'admin' });
      expect(result.role).toBe('admin');
    });
  });

  describe('activateUser', () => {
    it('debería activar un usuario', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'player' as const,
        total_score: 0,
        is_active: true,
      };

      mockedApiClient.patch.mockResolvedValue({ data: mockUser });

      const result = await usersService.activateUser('user-1');

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/users/user-1/activate', {});
      expect(result.is_active).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('debería desactivar un usuario', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'player' as const,
        total_score: 0,
        is_active: false,
      };

      mockedApiClient.patch.mockResolvedValue({ data: mockUser });

      const result = await usersService.deactivateUser('user-1');

      expect(mockedApiClient.patch).toHaveBeenCalledWith('/users/user-1/deactivate', {});
      expect(result.is_active).toBe(false);
    });
  });
});

