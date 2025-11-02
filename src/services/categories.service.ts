import apiClient from '@/lib/api-client';
import { Category } from '@/types/game';

class CategoriesService {
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/categories');
    return response.data;
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  }
}

export const categoriesService = new CategoriesService();

