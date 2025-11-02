import apiClient from '@/lib/api-client';
import { User, UpdateUserDto, ChangeRoleDto } from '@/types/auth';

export class UsersService {
  // Listar todos los usuarios (Admin)
  async getUsers(): Promise<User[]> {
    const res = await apiClient.get<User[]>('/users');
    return res.data;
  }

  // Actualizar usuario
  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const res = await apiClient.patch<User>(`/users/${id}`, dto);
    return res.data;
  }

  // Eliminar usuario
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  // Activar usuario
  async activateUser(id: string): Promise<User> {
    const res = await apiClient.patch<User>(`/users/${id}/activate`, {});
    return res.data;
  }

  // Desactivar usuario
  async deactivateUser(id: string): Promise<User> {
    const res = await apiClient.patch<User>(`/users/${id}/deactivate`, {});
    return res.data;
  }

  // Cambiar rol
  async changeUserRole(id: string, dto: ChangeRoleDto): Promise<User> {
    const res = await apiClient.patch<User>(`/users/${id}/change-role`, dto);
    return res.data;
  }
}

export const usersService = new UsersService();
