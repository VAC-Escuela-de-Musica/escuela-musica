import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import SubirMaterial from '../components/SubirMaterial';
import useAuth from '../hooks/useAuth';
import useMaterials from '../hooks/useMaterials';

// Mock de los hooks
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useMaterials');

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    upload: vi.fn(),
    success: vi.fn()
  }
}));

// Mock del fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockUseAuth = {
  user: { id: 1, role: 'teacher', username: 'teacher1' },
  isAuthenticated: true,
  isAdmin: false,
  isTeacher: true,
  isStudent: false,
  hasPermission: vi.fn().mockReturnValue(true)
};

const mockUseMaterials = {
  uploadMaterial: vi.fn(),
  loading: false,
  error: null,
  refreshMaterials: vi.fn()
};

// Mock de File para testing
class MockFile {
  constructor(name, size, type) {
    this.name = name;
    this.size = size;
    this.type = type;
    this.lastModified = Date.now();
  }
}

global.File = MockFile;

describe('SubirMaterial Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
    useMaterials.mockReturnValue(mockUseMaterials);
  });

  it('should render upload form', () => {
    render(<SubirMaterial />);

    expect(screen.getByText('Subir Material')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Instrumento')).toBeInTheDocument();
    expect(screen.getByLabelText('Dificultad')).toBeInTheDocument();
    expect(screen.getByLabelText('Género')).toBeInTheDocument();
    expect(screen.getByText('Arrastra archivos aquí o haz clic para seleccionar')).toBeInTheDocument();
  });

  it('should handle basic form input', async () => {
    render(<SubirMaterial />);

    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descripción');

    await userEvent.type(titleInput, 'Nueva Partitura');
    await userEvent.type(descriptionInput, 'Una hermosa partitura de piano');

    expect(titleInput).toHaveValue('Nueva Partitura');
    expect(descriptionInput).toHaveValue('Una hermosa partitura de piano');
  });

  it('should handle select inputs', async () => {
    render(<SubirMaterial />);

    const typeSelect = screen.getByLabelText('Tipo');
    const instrumentSelect = screen.getByLabelText('Instrumento');
    const difficultySelect = screen.getByLabelText('Dificultad');
    const genreSelect = screen.getByLabelText('Género');

    await userEvent.selectOptions(typeSelect, 'partitura');
    await userEvent.selectOptions(instrumentSelect, 'piano');
    await userEvent.selectOptions(difficultySelect, 'beginner');
    await userEvent.selectOptions(genreSelect, 'classical');

    expect(typeSelect).toHaveValue('partitura');
    expect(instrumentSelect).toHaveValue('piano');
    expect(difficultySelect).toHaveValue('beginner');
    expect(genreSelect).toHaveValue('classical');
  });

  it('should handle file selection via input', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');

    await userEvent.upload(fileInput, mockFile);

    expect(screen.getByText('partitura.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
    expect(screen.getByText('application/pdf')).toBeInTheDocument();
  });

  it('should handle multiple file selection', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFiles = [
      new MockFile('partitura1.pdf', 1024000, 'application/pdf'),
      new MockFile('partitura2.pdf', 2048000, 'application/pdf'),
      new MockFile('audio.mp3', 3072000, 'audio/mpeg')
    ];

    await userEvent.upload(fileInput, mockFiles);

    expect(screen.getByText('partitura1.pdf')).toBeInTheDocument();
    expect(screen.getByText('partitura2.pdf')).toBeInTheDocument();
    expect(screen.getByText('audio.mp3')).toBeInTheDocument();
    expect(screen.getByText('3 archivos seleccionados')).toBeInTheDocument();
  });

  it('should handle drag and drop', async () => {
    render(<SubirMaterial />);

    const dropZone = screen.getByTestId('drop-zone');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');

    const dragEvent = {
      dataTransfer: {
        files: [mockFile],
        items: [{ kind: 'file', type: 'application/pdf' }]
      }
    };

    fireEvent.dragOver(dropZone, dragEvent);
    expect(dropZone).toHaveClass('drag-over');

    fireEvent.drop(dropZone, dragEvent);
    expect(dropZone).not.toHaveClass('drag-over');

    await waitFor(() => {
      expect(screen.getByText('partitura.pdf')).toBeInTheDocument();
    });
  });

  it('should validate file types', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const invalidFile = new MockFile('documento.txt', 1024, 'text/plain');

    await userEvent.upload(fileInput, invalidFile);

    expect(screen.getByText('Tipo de archivo no soportado: text/plain')).toBeInTheDocument();
  });

  it('should validate file size', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const largeFile = new MockFile('archivo-grande.pdf', 50 * 1024 * 1024, 'application/pdf'); // 50MB

    await userEvent.upload(fileInput, largeFile);

    expect(screen.getByText('Archivo muy grande. Tamaño máximo: 10MB')).toBeInTheDocument();
  });

  it('should handle tags input', async () => {
    render(<SubirMaterial />);

    const tagsInput = screen.getByPlaceholderText('Agregar etiquetas (separadas por comas)');

    await userEvent.type(tagsInput, 'piano, classical, beginner');

    expect(tagsInput).toHaveValue('piano, classical, beginner');
  });

  it('should remove selected files', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');

    await userEvent.upload(fileInput, mockFile);

    expect(screen.getByText('partitura.pdf')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /eliminar/i });
    await userEvent.click(removeButton);

    expect(screen.queryByText('partitura.pdf')).not.toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    mockUseMaterials.uploadMaterial.mockResolvedValue({
      success: true,
      data: { id: 1, title: 'Nueva Partitura' }
    });

    render(<SubirMaterial />);

    // Llenar el formulario
    await userEvent.type(screen.getByLabelText('Título'), 'Nueva Partitura');
    await userEvent.type(screen.getByLabelText('Descripción'), 'Una hermosa partitura');
    await userEvent.selectOptions(screen.getByLabelText('Tipo'), 'partitura');
    await userEvent.selectOptions(screen.getByLabelText('Instrumento'), 'piano');
    await userEvent.selectOptions(screen.getByLabelText('Dificultad'), 'beginner');
    await userEvent.selectOptions(screen.getByLabelText('Género'), 'classical');

    // Agregar archivo
    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');
    await userEvent.upload(fileInput, mockFile);

    // Enviar formulario
    const submitButton = screen.getByRole('button', { name: /subir material/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUseMaterials.uploadMaterial).toHaveBeenCalledWith({
        title: 'Nueva Partitura',
        description: 'Una hermosa partitura',
        type: 'partitura',
        instrument: 'piano',
        difficulty: 'beginner',
        genre: 'classical',
        tags: [],
        files: [mockFile]
      });
    });

    expect(screen.getByText('Material subido exitosamente')).toBeInTheDocument();
  });

  it('should handle form validation errors', async () => {
    render(<SubirMaterial />);

    const submitButton = screen.getByRole('button', { name: /subir material/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('El título es requerido')).toBeInTheDocument();
    expect(screen.getByText('Debe seleccionar al menos un archivo')).toBeInTheDocument();
  });

  it('should handle upload errors', async () => {
    mockUseMaterials.uploadMaterial.mockRejectedValue(new Error('Error de red'));

    render(<SubirMaterial />);

    // Llenar formulario mínimo
    await userEvent.type(screen.getByLabelText('Título'), 'Nueva Partitura');
    
    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');
    await userEvent.upload(fileInput, mockFile);

    const submitButton = screen.getByRole('button', { name: /subir material/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error al subir el material')).toBeInTheDocument();
    });
  });

  it('should display upload progress', async () => {
    mockUseMaterials.uploadMaterial.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 1000);
      });
    });

    render(<SubirMaterial />);

    // Llenar formulario
    await userEvent.type(screen.getByLabelText('Título'), 'Nueva Partitura');
    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');
    await userEvent.upload(fileInput, mockFile);

    const submitButton = screen.getByRole('button', { name: /subir material/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('Subiendo...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should clear form after successful upload', async () => {
    mockUseMaterials.uploadMaterial.mockResolvedValue({
      success: true,
      data: { id: 1, title: 'Nueva Partitura' }
    });

    render(<SubirMaterial />);

    // Llenar formulario
    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descripción');
    
    await userEvent.type(titleInput, 'Nueva Partitura');
    await userEvent.type(descriptionInput, 'Una hermosa partitura');

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockFile = new MockFile('partitura.pdf', 1024000, 'application/pdf');
    await userEvent.upload(fileInput, mockFile);

    const submitButton = screen.getByRole('button', { name: /subir material/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
      expect(screen.queryByText('partitura.pdf')).not.toBeInTheDocument();
    });
  });

  it('should handle permission validation', () => {
    const mockUnauthorized = {
      ...mockUseAuth,
      hasPermission: vi.fn().mockReturnValue(false)
    };

    useAuth.mockReturnValue(mockUnauthorized);

    render(<SubirMaterial />);

    expect(screen.getByText('No tienes permisos para subir materiales')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /subir material/i })).not.toBeInTheDocument();
  });

  it('should display file preview for images', async () => {
    render(<SubirMaterial />);

    const fileInput = screen.getByLabelText('Seleccionar archivos');
    const mockImage = new MockFile('partitura.jpg', 1024000, 'image/jpeg');

    await userEvent.upload(fileInput, mockImage);

    expect(screen.getByText('partitura.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('Preview de partitura.jpg')).toBeInTheDocument();
  });

  it('should handle batch upload', async () => {
    render(<SubirMaterial />);

    const batchToggle = screen.getByLabelText('Subida en lote');
    await userEvent.click(batchToggle);

    expect(screen.getByText('Configuración de subida en lote')).toBeInTheDocument();
    expect(screen.getByText('Aplicar metadatos a todos los archivos')).toBeInTheDocument();
  });
});
