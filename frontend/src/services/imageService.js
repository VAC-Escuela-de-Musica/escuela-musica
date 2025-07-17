// Ejemplos de uso para mostrar imágenes desde MinIO en el Frontend

class ImageService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // ============= IMÁGENES PÚBLICAS (LANDPAGE) =============
  
  /**
   * Subir imagen pública (solo admin)
   * Estas imágenes son accesibles sin autenticación
   */
  async uploadPublicImage(imageFile, alt = "") {
    const formData = new FormData();
    formData.append('imagen', imageFile);
    
    const response = await fetch(`${this.baseURL}/api/materials/public/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Error subiendo imagen pública');
    }
    
    return response.json();
  }

  /**
   * Mostrar imagen pública en el frontend
   * URL directa, sin necesidad de autenticación
   */
  renderPublicImage(imageUrl, alt = "Imagen pública") {
    return `<img src="${imageUrl}" alt="${alt}" class="public-image" />`;
  }

  // ============= IMÁGENES PRIVADAS (MATERIAL DE PROFESOR) =============
  
  /**
   * Obtener imagen privada con autenticación
   * La imagen pasa por tu servidor backend
   */
  getPrivateImageUrl(filename) {
    return `${this.baseURL}/api/materials/private/image/${filename}`;
  }

  /**
   * Obtener URL temporal para imagen privada
   * URL con token temporal, más segura
   */
  async getPrivateImageTempUrl(filename, expiryMinutes = 60) {
    const response = await fetch(
      `${this.baseURL}/api/materials/private/image-url/${filename}?expiry=${expiryMinutes * 60}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Error obteniendo URL temporal');
    }
    
    const data = await response.json();
    return data.url;
  }

  /**
   * Mostrar imagen privada con autenticación persistente
   * Cada request incluye el token de autenticación
   */
  renderPrivateImageWithAuth(filename, alt = "Material privado") {
    const imageUrl = this.getPrivateImageUrl(filename);
    
    // Crear elemento img con headers personalizados
    const img = document.createElement('img');
    img.alt = alt;
    img.className = 'private-image';
    
    // Usar fetch para cargar la imagen con autenticación
    this.loadImageWithAuth(imageUrl, img);
    
    return img;
  }

  /**
   * Cargar imagen con autenticación usando fetch
   */
  async loadImageWithAuth(imageUrl, imgElement) {
    try {
      const response = await fetch(imageUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error cargando imagen');
      }
      
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      imgElement.src = objectURL;
      
      // Limpiar URL objeto cuando se termine de usar
      imgElement.onload = () => URL.revokeObjectURL(objectURL);
    } catch (error) {
      console.error('Error cargando imagen privada:', error);
      imgElement.src = '/placeholder-error.png'; // Imagen de error
    }
  }

  /**
   * Mostrar imagen privada con URL temporal
   * Más eficiente, pero la URL expira
   */
  async renderPrivateImageWithTempUrl(filename, alt = "Material privado") {
    try {
      const tempUrl = await this.getPrivateImageTempUrl(filename);
      return `<img src="${tempUrl}" alt="${alt}" class="private-image-temp" />`;
    } catch (error) {
      console.error('Error obteniendo URL temporal:', error);
      return `<img src="/placeholder-error.png" alt="Error cargando imagen" />`;
    }
  }
}

// ============= EJEMPLOS DE USO EN REACT/VUE/VANILLA JS =============

class ImageGallery {
  constructor() {
    this.imageService = new ImageService('http://localhost:1230', localStorage.getItem('token'));
  }

  // Ejemplo para React Component
  createReactPublicImage(imageUrl, alt) {
    return {
      jsx: `
        <img 
          src="${imageUrl}" 
          alt="${alt}"
          className="w-full h-64 object-cover rounded-lg"
          loading="lazy"
        />
      `
    };
  }

  // Ejemplo para React Component - Imagen Privada
  createReactPrivateImage(filename, alt) {
    return {
      jsx: `
        const [imageSrc, setImageSrc] = useState(null);
        const [loading, setLoading] = useState(true);
        
        useEffect(() => {
          const loadImage = async () => {
            try {
              const tempUrl = await imageService.getPrivateImageTempUrl('${filename}');
              setImageSrc(tempUrl);
            } catch (error) {
              console.error('Error:', error);
              setImageSrc('/error-placeholder.png');
            } finally {
              setLoading(false);
            }
          };
          
          loadImage();
        }, []);
        
        if (loading) return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
        
        return (
          <img 
            src={imageSrc} 
            alt="${alt}"
            className="w-full h-64 object-cover rounded-lg"
            onError={(e) => { e.target.src = '/error-placeholder.png'; }}
          />
        );
      `
    };
  }

  // Ejemplo para Vue Component
  createVuePrivateImage(filename, alt) {
    return {
      template: `
        <template>
          <div class="image-container">
            <img 
              v-if="!loading && imageSrc" 
              :src="imageSrc" 
              :alt="alt"
              class="private-image"
              @error="handleImageError"
            />
            <div v-else-if="loading" class="loading-placeholder">
              Cargando imagen...
            </div>
            <img v-else src="/error-placeholder.png" alt="Error" />
          </div>
        </template>
      `,
      script: `
        export default {
          data() {
            return {
              imageSrc: null,
              loading: true,
              alt: '${alt}'
            };
          },
          async mounted() {
            try {
              this.imageSrc = await this.imageService.getPrivateImageTempUrl('${filename}');
            } catch (error) {
              console.error('Error cargando imagen:', error);
            } finally {
              this.loading = false;
            }
          },
          methods: {
            handleImageError() {
              this.imageSrc = '/error-placeholder.png';
            }
          }
        };
      `
    };
  }

  // Ejemplo vanilla JavaScript
  createVanillaJSImageGallery(containerId, images) {
    const container = document.getElementById(containerId);
    
    images.forEach(async (imageData) => {
      const div = document.createElement('div');
      div.className = 'image-item';
      
      if (imageData.type === 'public') {
        // Imagen pública - URL directa
        div.innerHTML = `
          <img src="${imageData.url}" alt="${imageData.alt}" />
          <p>${imageData.description}</p>
        `;
      } else {
        // Imagen privada - URL temporal
        div.innerHTML = '<div class="loading">Cargando...</div>';
        
        try {
          const tempUrl = await this.imageService.getPrivateImageTempUrl(imageData.filename);
          div.innerHTML = `
            <img src="${tempUrl}" alt="${imageData.alt}" />
            <p>${imageData.description}</p>
          `;
        } catch (error) {
          div.innerHTML = `
            <img src="/error-placeholder.png" alt="Error" />
            <p>Error cargando imagen</p>
          `;
        }
      }
      
      container.appendChild(div);
    });
  }
}

// ============= CONFIGURACIÓN DE CACHE Y OPTIMIZACIÓN =============

class ImageCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50; // Máximo 50 URLs en cache
  }

  // Cache para URLs temporales de imágenes privadas
  async getCachedTempUrl(filename, imageService) {
    const now = Date.now();
    const cached = this.cache.get(filename);
    
    // Si está en cache y no ha expirado (con 5 min de margen)
    if (cached && cached.expiresAt > now + 5 * 60 * 1000) {
      return cached.url;
    }
    
    // Obtener nueva URL
    const newUrl = await imageService.getPrivateImageTempUrl(filename);
    
    // Guardar en cache
    this.cache.set(filename, {
      url: newUrl,
      expiresAt: now + 55 * 60 * 1000 // 55 minutos
    });
    
    // Limpiar cache si está muy lleno
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    return newUrl;
  }
}

export { ImageService, ImageGallery, ImageCacheManager };
