import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import MaterialFilters from '../components/domain/materials/MaterialFilters';
import useMaterials from '../hooks/useMaterials';
import useAuth from '../hooks/useAuth';

// Mock de los hooks
vi.mock('../hooks/useMaterials');
vi.mock('../hooks/useAuth');

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

const mockMaterials = [
  {
    id: 1,
    title: 'Partitura de Piano',
    type: 'partitura',
    instrument: 'piano',
    difficulty: 'beginner',
    genre: 'classical',
    tags: ['piano', 'classical'],
    createdAt: '2024-01-01T00:00:00Z',
    user: { id: 1, username: 'teacher1' }
  },
  {
    id: 2,
    title: 'Ejercicio de Guitarra',
    type: 'ejercicio',
    instrument: 'guitar',
    difficulty: 'intermediate',
    genre: 'rock',
    tags: ['guitar', 'rock'],
    createdAt: '2024-01-02T00:00:00Z',
    user: { id: 2, username: 'teacher2' }
  },
  {
    id: 3,
    title: 'Teoría Musical',
    type: 'teoria',
    instrument: 'general',
    difficulty: 'advanced',
    genre: 'academic',
    tags: ['theory', 'academic'],
    createdAt: '2024-01-03T00:00:00Z',
    user: { id: 3, username: 'teacher3' }
  }
];

const mockUseMaterials = {
  materials: mockMaterials,
  loading: false,
  error: null,
  searchTerm: '',
  setSearchTerm: vi.fn(),
  filters: {
    type: '',
    instrument: '',
    difficulty: '',
    genre: '',
    tags: []
  },
  setFilters: vi.fn(),
  clearFilters: vi.fn(),
  activeFilters: {},
  filteredMaterials: mockMaterials,
  totalMaterials: mockMaterials.length,
  stats: {
    totalMaterials: 3,
    byType: { partitura: 1, ejercicio: 1, teoria: 1 },
    byInstrument: { piano: 1, guitar: 1, general: 1 },
    byDifficulty: { beginner: 1, intermediate: 1, advanced: 1 },
    byGenre: { classical: 1, rock: 1, academic: 1 }
  }
};

const mockUseAuth = {
  user: { id: 1, role: 'student' },
  isAuthenticated: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: true
};

describe('MaterialFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMaterials.mockReturnValue(mockUseMaterials);
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('should render filter interface', () => {
    render(<MaterialFilters />);

    expect(screen.getByText('Filtros de Material')).toBeInTheDocument();
    expect(screen.getByText('Buscar materiales...')).toBeInTheDocument();
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Instrumento')).toBeInTheDocument();
    expect(screen.getByText('Dificultad')).toBeInTheDocument();
    expect(screen.getByText('Género')).toBeInTheDocument();
  });

  it('should display statistics', () => {
    render(<MaterialFilters />);

    expect(screen.getByText('3 materiales encontrados')).toBeInTheDocument();
    expect(screen.getByText('Partituras: 1')).toBeInTheDocument();
    expect(screen.getByText('Ejercicios: 1')).toBeInTheDocument();
    expect(screen.getByText('Teoría: 1')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    render(<MaterialFilters />);

    const searchInput = screen.getByPlaceholderText('Buscar materiales...');
    await userEvent.type(searchInput, 'piano');

    expect(mockUseMaterials.setSearchTerm).toHaveBeenCalledWith('piano');
  });

  it('should handle type filter selection', async () => {
    render(<MaterialFilters />);

    const typeSelect = screen.getByDisplayValue('Todos los tipos');
    await userEvent.selectOptions(typeSelect, 'partitura');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'partitura' })
    );
  });

  it('should handle instrument filter selection', async () => {
    render(<MaterialFilters />);

    const instrumentSelect = screen.getByDisplayValue('Todos los instrumentos');
    await userEvent.selectOptions(instrumentSelect, 'piano');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ instrument: 'piano' })
    );
  });

  it('should handle difficulty filter selection', async () => {
    render(<MaterialFilters />);

    const difficultySelect = screen.getByDisplayValue('Todas las dificultades');
    await userEvent.selectOptions(difficultySelect, 'beginner');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'beginner' })
    );
  });

  it('should handle genre filter selection', async () => {
    render(<MaterialFilters />);

    const genreSelect = screen.getByDisplayValue('Todos los géneros');
    await userEvent.selectOptions(genreSelect, 'classical');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ genre: 'classical' })
    );
  });

  it('should handle tag filter', async () => {
    render(<MaterialFilters />);

    const tagInput = screen.getByPlaceholderText('Agregar etiqueta...');
    await userEvent.type(tagInput, 'piano');
    await userEvent.keyboard('{Enter}');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['piano'] })
    );
  });

  it('should display active filters', () => {
    const mockWithActiveFilters = {
      ...mockUseMaterials,
      activeFilters: {
        type: 'partitura',
        instrument: 'piano',
        difficulty: 'beginner'
      }
    };

    useMaterials.mockReturnValue(mockWithActiveFilters);

    render(<MaterialFilters />);

    expect(screen.getByText('Filtros activos:')).toBeInTheDocument();
    expect(screen.getByText('Tipo: partitura')).toBeInTheDocument();
    expect(screen.getByText('Instrumento: piano')).toBeInTheDocument();
    expect(screen.getByText('Dificultad: beginner')).toBeInTheDocument();
  });

  it('should clear all filters', async () => {
    const mockWithActiveFilters = {
      ...mockUseMaterials,
      activeFilters: {
        type: 'partitura',
        instrument: 'piano'
      }
    };

    useMaterials.mockReturnValue(mockWithActiveFilters);

    render(<MaterialFilters />);

    const clearButton = screen.getByText('Limpiar filtros');
    await userEvent.click(clearButton);

    expect(mockUseMaterials.clearFilters).toHaveBeenCalled();
  });

  it('should display loading state', () => {
    const mockLoading = {
      ...mockUseMaterials,
      loading: true
    };

    useMaterials.mockReturnValue(mockLoading);

    render(<MaterialFilters />);

    expect(screen.getByText('Cargando filtros...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const mockError = {
      ...mockUseMaterials,
      error: 'Error al cargar materiales'
    };

    useMaterials.mockReturnValue(mockError);

    render(<MaterialFilters />);

    expect(screen.getByText('Error al cargar materiales')).toBeInTheDocument();
  });

  it('should display no materials message', () => {
    const mockEmpty = {
      ...mockUseMaterials,
      materials: [],
      filteredMaterials: [],
      totalMaterials: 0,
      stats: {
        totalMaterials: 0,
        byType: {},
        byInstrument: {},
        byDifficulty: {},
        byGenre: {}
      }
    };

    useMaterials.mockReturnValue(mockEmpty);

    render(<MaterialFilters />);

    expect(screen.getByText('0 materiales encontrados')).toBeInTheDocument();
    expect(screen.getByText('No hay materiales disponibles')).toBeInTheDocument();
  });

  it('should handle date range filter', async () => {
    render(<MaterialFilters />);

    const startDateInput = screen.getByLabelText('Fecha inicio');
    const endDateInput = screen.getByLabelText('Fecha fin');

    await userEvent.type(startDateInput, '2024-01-01');
    await userEvent.type(endDateInput, '2024-01-31');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      })
    );
  });

  it('should handle author filter', async () => {
    render(<MaterialFilters />);

    const authorInput = screen.getByPlaceholderText('Filtrar por autor...');
    await userEvent.type(authorInput, 'teacher1');

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ author: 'teacher1' })
    );
  });

  it('should display filter shortcuts for teachers', () => {
    const mockTeacher = {
      ...mockUseAuth,
      isTeacher: true,
      isStudent: false
    };

    useAuth.mockReturnValue(mockTeacher);

    render(<MaterialFilters />);

    expect(screen.getByText('Mis materiales')).toBeInTheDocument();
    expect(screen.getByText('Recientes')).toBeInTheDocument();
    expect(screen.getByText('Populares')).toBeInTheDocument();
  });

  it('should handle filter shortcuts', async () => {
    const mockTeacher = {
      ...mockUseAuth,
      isTeacher: true,
      isStudent: false
    };

    useAuth.mockReturnValue(mockTeacher);

    render(<MaterialFilters />);

    const myMaterialsButton = screen.getByText('Mis materiales');
    await userEvent.click(myMaterialsButton);

    expect(mockUseMaterials.setFilters).toHaveBeenCalledWith(
      expect.objectContaining({ author: mockTeacher.user.id })
    );
  });

  it('should toggle advanced filters', async () => {
    render(<MaterialFilters />);

    const advancedButton = screen.getByText('Filtros avanzados');
    await userEvent.click(advancedButton);

    expect(screen.getByText('Fecha inicio')).toBeInTheDocument();
    expect(screen.getByText('Fecha fin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filtrar por autor...')).toBeInTheDocument();
  });

  it('should save and load filter presets', async () => {
    render(<MaterialFilters />);

    // Establecer algunos filtros
    const typeSelect = screen.getByDisplayValue('Todos los tipos');
    await userEvent.selectOptions(typeSelect, 'partitura');

    const instrumentSelect = screen.getByDisplayValue('Todos los instrumentos');
    await userEvent.selectOptions(instrumentSelect, 'piano');

    // Guardar preset
    const saveButton = screen.getByText('Guardar preset');
    await userEvent.click(saveButton);

    const presetInput = screen.getByPlaceholderText('Nombre del preset...');
    await userEvent.type(presetInput, 'Mis partituras de piano');

    const confirmButton = screen.getByText('Guardar');
    await userEvent.click(confirmButton);

    // Verificar que se guardó en localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'material-filter-presets',
      expect.stringContaining('Mis partituras de piano')
    );
  });
});
