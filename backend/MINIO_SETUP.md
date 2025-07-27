# Configuración de MinIO para GPS-VAC

## ¿Qué es MinIO?

MinIO es un servidor de almacenamiento de objetos compatible con Amazon S3 que se utiliza para almacenar las imágenes del carrusel en esta aplicación.

## Instalación y Configuración

### 1. Instalar MinIO

#### Opción A: Usando Docker (Recomendado)
```bash
docker run -p 9000:9000 -p 9001:9001 --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio_data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

#### Opción B: Instalación directa
Descarga MinIO desde: https://min.io/download

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Server Configuration
PORT=1230
HOST=localhost

# Database Configuration
DB_URL=mongodb://localhost:27017/gps-vac

# JWT Configuration
ACCESS_JWT_SECRET=your_access_jwt_secret_key_here
REFRESH_JWT_SECRET=your_refresh_jwt_secret_key_here

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=carousel-images
```

### 3. Verificar la configuración

Ejecuta el script de verificación:

```bash
cd backend
node scripts/check-minio.js
```

### 4. Acceder a la consola de MinIO

Una vez que MinIO esté ejecutándose, puedes acceder a la consola web en:
- URL: http://localhost:9001
- Usuario: minioadmin
- Contraseña: minioadmin

## Solución de problemas

### Error 500 al subir imágenes

Si recibes un error 500 al intentar subir imágenes al carrusel, verifica:

1. **MinIO está ejecutándose**: Asegúrate de que MinIO esté corriendo en el puerto 9000
2. **Variables de entorno**: Verifica que el archivo `.env` existe y tiene las variables correctas
3. **Credenciales**: Las credenciales por defecto son `minioadmin/minioadmin`
4. **Puerto**: MinIO debe estar ejecutándose en el puerto 9000

### Verificar el estado de MinIO

```bash
# Si usas Docker
docker ps | grep minio

# Verificar si el puerto está en uso
netstat -an | grep 9000
```

### Logs de MinIO

```bash
# Si usas Docker
docker logs minio
```

## Estructura de archivos

- Las imágenes se almacenan en el bucket `carousel-images`
- Los nombres de archivo siguen el patrón: `carousel-{uuid}.{extension}`
- Las URLs públicas se generan automáticamente 