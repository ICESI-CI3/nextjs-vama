import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RankingsPage from '@/app/rankings/page';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { rankingsService } from '@/services/rankings.service';
import { categoriesService } from '@/services/categories.service';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/rankings.service', () => ({
  rankingsService: {
    getGlobalRanking: jest.fn(),
    getCategoryRanking: jest.fn(),
    getUserRanking: jest.fn(),
  },
}));

jest.mock('@/services/categories.service', () => ({
  categoriesService: {
    getCategories: jest.fn(),
  },
}));

jest.mock('@/app/rankings/rankings.module.css', () => new Proxy({}, { get: (_, prop) => prop }));

const pushMock = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: pushMock });

describe('RankingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Caso 1: Usuario no autenticado redirige al login
  it('redirecciona al login si no está autenticado', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: jest.fn(),
    });

    render(<RankingsPage />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });

  // Caso 2: Renderizado de pantalla de carga
  it('muestra pantalla de carga cuando está cargando', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: 'Valentina' },
      isAuthenticated: true,
      isLoading: true,
      logout: jest.fn(),
    });

    render(<RankingsPage />);
    expect(screen.getByText('Cargando rankings...')).toBeInTheDocument();
  });

  // Caso 3: Renderiza rankings y categorías correctamente
    it('muestra los rankings y categorías cargados', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Valentina' },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    (categoriesService.getCategories as jest.Mock).mockResolvedValue([
      { id: 'cat1', name: 'Categoría 1' },
    ]);

    (rankingsService.getGlobalRanking as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        top_players: [
          { user_id: 1, username: 'Val', position: 1, total_score: 1000 },
          { user_id: 2, username: 'Juan', position: 2, total_score: 800 },
          { user_id: 3, username: 'Ana', position: 3, total_score: 700 },
          { user_id: 4, username: 'Pedro', position: 4, total_score: 600 },
        ],
        last_updated: '2025-11-01T12:00:00Z',
      },
    });

    (rankingsService.getUserRanking as jest.Mock).mockResolvedValue({
      success: true,
      data: { username: 'Val', position: 1, total_score: 1000 },
    });

    render(<RankingsPage />);

    await waitFor(() => {
  expect(screen.getByText('Top 3')).toBeInTheDocument();
  expect(screen.getAllByText('Val').length).toBeGreaterThan(0);
  expect(screen.getByText('Pedro')).toBeInTheDocument();
});


    expect(screen.getByRole('button', { name: /Refrescar/i })).toBeInTheDocument();
  });

  // Caso 4: Muestra mensaje cuando no hay jugadores
  it('muestra mensaje "No hay jugadores" si el ranking está vacío', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Valentina' },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    (categoriesService.getCategories as jest.Mock).mockResolvedValue([]);
    (rankingsService.getGlobalRanking as jest.Mock).mockResolvedValue({
      success: true,
      data: { top_players: [] },
    });
    (rankingsService.getUserRanking as jest.Mock).mockResolvedValue(null);

    render(<RankingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No hay jugadores en esta categoría/)).toBeInTheDocument();
    });
  });

  // Caso 5: Error al cargar rankings
    it('muestra error cuando fetchAll falla', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Valentina' },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    // Provoca fallo total en la carga (para activar el catch principal)
    (categoriesService.getCategories as jest.Mock).mockImplementation(() => {
      throw new Error('Falla total');
    });

    render(<RankingsPage />);

    await waitFor(() => {
    expect(screen.getByText(/No hay jugadores en esta categoría./i)).toBeInTheDocument();
  });

  });

  // Caso 6: Cambio de categoría dispara fetch
  it('cambia de categoría y actualiza ranking', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 1, name: 'Valentina' },
      isAuthenticated: true,
      isLoading: false,
      logout: jest.fn(),
    });

    (categoriesService.getCategories as jest.Mock).mockResolvedValue([
      { id: 'cat1', name: 'Categoría 1' },
    ]);

    (rankingsService.getGlobalRanking as jest.Mock).mockResolvedValue({
      success: true,
      data: { top_players: [] },
    });

    (rankingsService.getCategoryRanking as jest.Mock).mockResolvedValue({
      success: true,
      data: { top_players: [{ user_id: 5, username: 'Pepe', position: 1, total_score: 300 }] },
    });

    render(<RankingsPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cat1' } });

    await waitFor(() => {
      expect(rankingsService.getCategoryRanking).toHaveBeenCalledWith('cat1', 1, 50);
    });
  });
});
