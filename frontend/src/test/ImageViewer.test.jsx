import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ImageViewer from '../components/ImageViewer';
import useAuth from '../hooks/useAuth';

// Mock del hook useAuth
vi.mock('../hooks/useAuth');

// Mock del logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

const mockUseAuth = {
  user: { id: 1, role: 'student' },
  isAuthenticated: true,
  isAdmin: false,
  isTeacher: false,
  isStudent: true
};

const mockImageData = {
  id: 1,
  title: 'Partitura de Piano',
  description: 'Una hermosa partitura de piano',
  fileUrl: 'https://example.com/partitura.jpg',
  fileName: 'partitura.jpg',
  fileType: 'image/jpeg',
  fileSize: 1024000,
  uploadDate: '2024-01-01T00:00:00Z',
  uploader: {
    id: 1,
    username: 'teacher1',
    email: 'teacher@example.com'
  }
};

describe('ImageViewer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(mockUseAuth);
  });

  it('should render image viewer modal', () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('image-viewer-modal')).toBeInTheDocument();
    expect(screen.getByText('Partitura de Piano')).toBeInTheDocument();
    expect(screen.getByText('Una hermosa partitura de piano')).toBeInTheDocument();
    expect(screen.getByAltText('Partitura de Piano')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ImageViewer image={mockImageData} isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByTestId('image-viewer-modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByTestId('image-viewer-overlay');
    await userEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not close when image is clicked', async () => {
    const mockOnClose = vi.fn();
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={mockOnClose} />);

    const imageContainer = screen.getByTestId('image-container');
    await userEvent.click(imageContainer);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle zoom in', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    await userEvent.click(zoomInButton);

    const image = screen.getByAltText('Partitura de Piano');
    expect(image).toHaveStyle('transform: scale(1.25)');
  });

  it('should handle zoom out', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    await userEvent.click(zoomOutButton);

    const image = screen.getByAltText('Partitura de Piano');
    expect(image).toHaveStyle('transform: scale(0.8)');
  });

  it('should reset zoom', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    // Zoom in first
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    await userEvent.click(zoomInButton);

    // Then reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await userEvent.click(resetButton);

    const image = screen.getByAltText('Partitura de Piano');
    expect(image).toHaveStyle('transform: scale(1)');
  });

  it('should handle fullscreen toggle', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const fullscreenButton = screen.getByRole('button', { name: /fullscreen/i });
    await userEvent.click(fullscreenButton);

    const modal = screen.getByTestId('image-viewer-modal');
    expect(modal).toHaveClass('fullscreen');
  });

  it('should handle keyboard shortcuts', async () => {
    const mockOnClose = vi.fn();
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={mockOnClose} />);

    const modal = screen.getByTestId('image-viewer-modal');

    // Test Escape key
    fireEvent.keyDown(modal, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();

    // Test zoom shortcuts
    fireEvent.keyDown(modal, { key: '+' });
    const image = screen.getByAltText('Partitura de Piano');
    expect(image).toHaveStyle('transform: scale(1.25)');

    fireEvent.keyDown(modal, { key: '-' });
    expect(image).toHaveStyle('transform: scale(1)');

    fireEvent.keyDown(modal, { key: '0' });
    expect(image).toHaveStyle('transform: scale(1)');
  });

  it('should display image metadata', () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('partitura.jpg')).toBeInTheDocument();
    expect(screen.getByText('1.00 MB')).toBeInTheDocument();
    expect(screen.getByText('image/jpeg')).toBeInTheDocument();
    expect(screen.getByText('teacher1')).toBeInTheDocument();
  });

  it('should handle download', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['mock image data']))
    });
    global.fetch = mockFetch;

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.createObjectURL = mockCreateObjectURL;

    const mockRevokeObjectURL = vi.fn();
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const downloadButton = screen.getByRole('button', { name: /descargar/i });
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(mockImageData.fileUrl);
    });

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should handle image loading error', async () => {
    const mockImageWithError = {
      ...mockImageData,
      fileUrl: 'https://example.com/nonexistent.jpg'
    };

    render(<ImageViewer image={mockImageWithError} isOpen={true} onClose={vi.fn()} />);

    const image = screen.getByAltText('Partitura de Piano');
    fireEvent.error(image);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar la imagen')).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const image = screen.getByAltText('Partitura de Piano');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should handle drag to pan', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const image = screen.getByAltText('Partitura de Piano');
    
    // Simulate drag
    fireEvent.mouseDown(image, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(image, { clientX: 150, clientY: 150 });
    fireEvent.mouseUp(image);

    // The image should have been panned
    expect(image).toHaveStyle('transform: translate(50px, 50px)');
  });

  it('should handle mouse wheel zoom', async () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const image = screen.getByAltText('Partitura de Piano');
    
    // Simulate wheel event for zoom in
    fireEvent.wheel(image, { deltaY: -100 });

    expect(image).toHaveStyle('transform: scale(1.1)');

    // Simulate wheel event for zoom out
    fireEvent.wheel(image, { deltaY: 100 });

    expect(image).toHaveStyle('transform: scale(1)');
  });

  it('should display thumbnail navigation', () => {
    const mockImages = [
      mockImageData,
      { ...mockImageData, id: 2, title: 'Partitura 2', fileUrl: 'https://example.com/partitura2.jpg' },
      { ...mockImageData, id: 3, title: 'Partitura 3', fileUrl: 'https://example.com/partitura3.jpg' }
    ];

    render(
      <ImageViewer 
        image={mockImageData} 
        images={mockImages}
        isOpen={true} 
        onClose={vi.fn()} 
        onImageChange={vi.fn()}
      />
    );

    expect(screen.getByText('1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should handle image navigation', async () => {
    const mockImages = [
      mockImageData,
      { ...mockImageData, id: 2, title: 'Partitura 2', fileUrl: 'https://example.com/partitura2.jpg' },
      { ...mockImageData, id: 3, title: 'Partitura 3', fileUrl: 'https://example.com/partitura3.jpg' }
    ];

    const mockOnImageChange = vi.fn();

    render(
      <ImageViewer 
        image={mockImageData} 
        images={mockImages}
        isOpen={true} 
        onClose={vi.fn()} 
        onImageChange={mockOnImageChange}
      />
    );

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await userEvent.click(nextButton);

    expect(mockOnImageChange).toHaveBeenCalledWith(1); // Index 1 (second image)
  });

  it('should handle keyboard navigation', async () => {
    const mockImages = [
      mockImageData,
      { ...mockImageData, id: 2, title: 'Partitura 2' },
      { ...mockImageData, id: 3, title: 'Partitura 3' }
    ];

    const mockOnImageChange = vi.fn();

    render(
      <ImageViewer 
        image={mockImageData} 
        images={mockImages}
        isOpen={true} 
        onClose={vi.fn()} 
        onImageChange={mockOnImageChange}
      />
    );

    const modal = screen.getByTestId('image-viewer-modal');

    // Test arrow key navigation
    fireEvent.keyDown(modal, { key: 'ArrowRight' });
    expect(mockOnImageChange).toHaveBeenCalledWith(1);

    fireEvent.keyDown(modal, { key: 'ArrowLeft' });
    expect(mockOnImageChange).toHaveBeenCalledWith(2); // Wraps to last image
  });

  it('should display image actions for authenticated users', () => {
    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
  });

  it('should handle share functionality', async () => {
    const mockShare = vi.fn();
    global.navigator.share = mockShare;

    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const shareButton = screen.getByRole('button', { name: /compartir/i });
    await userEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith({
      title: 'Partitura de Piano',
      text: 'Una hermosa partitura de piano',
      url: mockImageData.fileUrl
    });
  });

  it('should handle copy link functionality', async () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText
      }
    });

    render(<ImageViewer image={mockImageData} isOpen={true} onClose={vi.fn()} />);

    const copyButton = screen.getByRole('button', { name: /copiar enlace/i });
    await userEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(mockImageData.fileUrl);
  });
});
