import { categoriesService } from '../categories.service';
import apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('CategoriesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('debería obtener todas las categorías', async () => {
      const mockCategories = [
        { id: '1', name: 'Science', description: 'Science questions' },
        { id: '2', name: 'History', description: 'History questions' },
        { id: '3', name: 'Math', description: 'Math questions' },
      ];

      mockedApiClient.get.mockResolvedValue({ data: mockCategories });

      const result = await categoriesService.getCategories();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(3);
    });

    it('debería manejar respuesta vacía', async () => {
      mockedApiClient.get.mockResolvedValue({ data: [] });

      const result = await categoriesService.getCategories();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getCategoryById', () => {
    it('debería obtener una categoría por ID', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Science',
        description: 'Science questions',
      };

      mockedApiClient.get.mockResolvedValue({ data: mockCategory });

      const result = await categoriesService.getCategoryById('cat-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/categories/cat-1');
      expect(result).toEqual(mockCategory);
      expect(result.name).toBe('Science');
    });

    it('debería llamar al endpoint correcto', async () => {
      const mockCategory = { id: 'cat-2', name: 'History' };
      
      mockedApiClient.get.mockResolvedValue({ data: mockCategory });
      
      await categoriesService.getCategoryById('cat-2');
      
      expect(mockedApiClient.get).toHaveBeenCalledWith('/categories/cat-2');
    });
  });
});

