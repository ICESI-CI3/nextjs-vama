import { render, screen, fireEvent } from '@testing-library/react';
import { TriviaCard } from '../TriviaCard';
import { Trivia, Category } from '@/types/game';

describe('TriviaCard Component', () => {
  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Science' },
    { id: 'cat-2', name: 'History' },
  ];

  const mockTrivia: Trivia = {
    id: 'trivia-1',
    title: 'Test Trivia',
    category_id: 'cat-1',
    difficulty_level: 'medium',
    status: 'draft',
    is_public: true,
    plays_count: 10,
    avg_score: 75,
    created_by: 'user-1',
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPublish: jest.fn(),
    onArchive: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar la información de la trivia', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Trivia')).toBeInTheDocument();
    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it('debería mostrar el botón de editar', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const editButton = screen.getByText(/editar/i);
    expect(editButton).toBeInTheDocument();
  });

  it('debería llamar a onEdit al hacer click en editar', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const editButton = screen.getByText(/editar/i);
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith('trivia-1');
  });

  it('debería mostrar el botón de publicar para trivias en draft', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const publishButton = screen.getByText(/publicar/i);
    expect(publishButton).toBeInTheDocument();
  });

  it('debería mostrar estado publicada para trivias publicadas', () => {
    const publishedTrivia = { ...mockTrivia, status: 'published' as const };

    render(
      <TriviaCard
        trivia={publishedTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/publicada/i)).toBeInTheDocument();
  });

  it('debería llamar a onDelete al hacer click en eliminar', () => {
    render(
      <TriviaCard
        trivia={mockTrivia}
        categories={mockCategories}
        {...mockHandlers}
      />
    );

    const deleteButton = screen.getByTitle(/eliminar trivia/i);
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('trivia-1');
  });
});

