import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTriviaModal } from '../CreateTriviaModal';
import { triviasService } from '@/services/trivias.service';
import { Category } from '@/types/game';

// Mock del servicio de trivias
jest.mock('@/services/trivias.service');
const mockedTriviasService = triviasService as jest.Mocked<typeof triviasService>;

describe('CreateTriviaModal Component', () => {
  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Science' },
    { id: 'cat-2', name: 'History' },
  ];

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el formulario', () => {
    render(
      <CreateTriviaModal
        categories={mockCategories}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/nueva trivia/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it('debería mostrar las categorías en el select', () => {
    render(
      <CreateTriviaModal
        categories={mockCategories}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('debería llamar a onClose al hacer click en cancelar', () => {
    render(
      <CreateTriviaModal
        categories={mockCategories}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText(/cancelar/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('debería crear trivia y llamar a onSuccess', async () => {
    const mockTrivia = {
      id: 'new-trivia',
      title: 'New Trivia',
      category_id: 'cat-1',
      difficulty_level: 'easy' as const,
      status: 'draft' as const,
      is_public: false,
      plays_count: 0,
      avg_score: 0,
      created_by: 'user-1',
    };

    mockedTriviasService.createTrivia.mockResolvedValue(mockTrivia);

    render(
      <CreateTriviaModal
        categories={mockCategories}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Completar formulario
    const titleInput = screen.getByLabelText(/título/i);
    fireEvent.change(titleInput, { target: { value: 'New Trivia' } });

    const submitButton = screen.getByText(/crear trivia/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('new-trivia');
    });
  });

  it('debería mostrar los niveles de dificultad', () => {
    render(
      <CreateTriviaModal
        categories={mockCategories}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/fácil/i)).toBeInTheDocument();
    expect(screen.getAllByText(/media/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/difícil/i)).toBeInTheDocument();
  });
});

