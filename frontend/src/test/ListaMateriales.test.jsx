import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ListaMateriales from '../components/domain/materials/ListaMateriales';

// Mock de los hooks
const mockUseMaterials = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../hooks/useMaterials.js', () => ({
  useMaterials: () => mockUseMaterials()
}));

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    filters: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de los componentes
vi.mock('../components/ImageViewer', () => ({
  default: ({ isOpen, onClose, image }) => (
    isOpen ? (
      <div data-testid="image-viewer">
        <button onClick={onClose}>Cerrar</button>
        <img src={image.url} alt={image.title} />
      </div>
    ) : null
  )
}));

vi.mock('../components/domain/materials/MaterialFilters', () => ({
  default: ({ onFilterChange, loading }) => (
    <div data-testid="material-filters">
      <button onClick={() => onFilterChange({ searchTerm: 'test' })}>
        Aplicar Filtros
      </button>
      {loading && <span>Cargando filtros...</span>}
    </div>
  )
}));

describe('ListaMateriales Component', () => {
  const mockMaterials = [
    {
      _id: '1',
      title: 'Material 1',
      description: 'Descripción del material 1',
      mimeType: 'image/jpeg',
      category: 'Partitura',
      level: 'beginner',
      instrument: 'Piano',
      tags: ['piano', 'principiante'],
      fileSize: 1024,
      createdAt: '2023-01-01T00:00:00.000Z',
      isPublic: true,
      viewUrl: 'http://example.com/view/1',
      downloadUrl: 'http://example.com/download/1',
      userId: { username: 'testuser' },
      isFavorite: false
    },
    {
      _id: '2',
      title: 'Material 2',
      description: 'Descripción del material 2',
      mimeType: 'application/pdf',
      category: 'Método',
      level: 'intermediate',
      instrument: 'Guitarra',
      tags: ['guitarra', 'intermedio'],
      fileSize: 2048,
      createdAt: '2023-01-02T00:00:00.000Z',
      isPublic: false,
      viewUrl: 'http://example.com/view/2',
      downloadUrl: 'http://example.com/download/2',
      userId: { username: 'testuser2' },
      isFavorite: true
    }
  ];

  const mockFunctions = {
    fetchMaterials: vi.fn(),
    searchMaterials: vi.fn(),
    toggleFavorite: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    goToPage: vi.fn(),
    clearError: vi.fn()
  };

  beforeEach(() => {
    mockUseMaterials.mockReturnValue({
      materials: mockMaterials,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        totalPages: 1,
        totalCount: 2,
        hasNextPage: false,
        hasPrevPage: false
      },
      ...mockFunctions
    });

    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders materials list correctly', () => {
    render(<ListaMateriales />);
    
    expect(screen.getByText('📚 Materiales Educativos')).toBeInTheDocument();
    expect(screen.getByText('Material 1')).toBeInTheDocument();
    expect(screen.getByText('Material 2')).toBeInTheDocument();
    expect(screen.getByText('Total: 2 materiales')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseMaterials.mockReturnValue({
      materials: [],
      loading: true,
      error: null,
      pagination: {},
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    expect(screen.getByText('Cargando materiales...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseMaterials.mockReturnValue({
      materials: [],
      loading: false,
      error: 'Error al cargar materiales',
      pagination: {},
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    // Use getAllByText to handle multiple elements with same text
    const errorElements = screen.getAllByText('Error al cargar materiales');
    expect(errorElements).toHaveLength(2); // h2 and p elements
    expect(screen.getByText('Intentar de nuevo')).toBeInTheDocument();
  });

  it('shows no auth message when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false
    });
    
    render(<ListaMateriales />);
    
    expect(screen.getByText('Acceso requerido')).toBeInTheDocument();
    expect(screen.getByText('Debes iniciar sesión para ver los materiales.')).toBeInTheDocument();
  });

  it('displays material information correctly', () => {
    render(<ListaMateriales />);
    
    // Verificar información del primer material
    expect(screen.getByText('Material 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción del material 1')).toBeInTheDocument();
    expect(screen.getByText('Partitura')).toBeInTheDocument();
    expect(screen.getByText('Principiante')).toBeInTheDocument();
    expect(screen.getByText('Piano')).toBeInTheDocument();
    expect(screen.getByText('piano')).toBeInTheDocument();
    expect(screen.getByText('principiante')).toBeInTheDocument();
    expect(screen.getByText('🌍 Público')).toBeInTheDocument();
    
    // Verificar información del segundo material
    expect(screen.getByText('Material 2')).toBeInTheDocument();
    expect(screen.getByText('🔒 Privado')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
  });

  it('handles favorite toggle', async () => {
    const user = userEvent.setup();
    mockFunctions.toggleFavorite.mockResolvedValue({ success: true });
    
    render(<ListaMateriales />);
    
    const favoriteButtons = screen.getAllByTitle(/favoritos/i);
    await user.click(favoriteButtons[0]);
    
    expect(mockFunctions.toggleFavorite).toHaveBeenCalledWith('1');
  });

  it('opens image viewer for image materials', async () => {
    const user = userEvent.setup();
    
    render(<ListaMateriales />);
    
    const viewButtons = screen.getAllByText('👁️ Ver');
    await user.click(viewButtons[0]);
    
    expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    const user = userEvent.setup();
    
    render(<ListaMateriales />);
    
    const filterButton = screen.getByText('Aplicar Filtros');
    await user.click(filterButton);
    
    expect(mockFunctions.searchMaterials).toHaveBeenCalled();
  });

  it('shows pagination when multiple pages exist', () => {
    mockUseMaterials.mockReturnValue({
      materials: mockMaterials,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
        hasPrevPage: false
      },
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('(30 materiales total)')).toBeInTheDocument();
    expect(screen.getByText('Siguiente →')).toBeInTheDocument();
  });

  it('handles pagination navigation', async () => {
    const user = userEvent.setup();
    
    mockUseMaterials.mockReturnValue({
      materials: mockMaterials,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
        hasPrevPage: false
      },
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    const nextButton = screen.getByText('Siguiente →');
    await user.click(nextButton);
    
    expect(mockFunctions.nextPage).toHaveBeenCalled();
  });

  it('shows no materials message when list is empty', () => {
    mockUseMaterials.mockReturnValue({
      materials: [],
      loading: false,
      error: null,
      pagination: { totalCount: 0 },
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    expect(screen.getByText('No hay materiales disponibles')).toBeInTheDocument();
  });

  it('clears error when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    mockUseMaterials.mockReturnValue({
      materials: [],
      loading: false,
      error: 'Error al cargar materiales',
      pagination: {},
      ...mockFunctions
    });
    
    render(<ListaMateriales />);
    
    const retryButton = screen.getByText('Intentar de nuevo');
    await user.click(retryButton);
    
    expect(mockFunctions.clearError).toHaveBeenCalled();
  });

  it('displays correct file icons based on mime type', () => {
    render(<ListaMateriales />);
    
    // Verificar iconos de archivos
    expect(screen.getByText('🖼️')).toBeInTheDocument(); // Imagen
    expect(screen.getByText('📄')).toBeInTheDocument(); // PDF
  });

  it('shows download links for materials', () => {
    render(<ListaMateriales />);
    
    const downloadLinks = screen.getAllByText('⬇️ Descargar');
    expect(downloadLinks).toHaveLength(2);
    expect(downloadLinks[0]).toHaveAttribute('href', 'http://example.com/download/1');
  });
});
