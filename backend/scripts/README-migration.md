# Scripts de Migración de Imágenes

Este directorio contiene scripts para migrar imágenes del bucket `imagenes-publicas` al bucket `galeria-imagenes` en MinIO.

## Scripts Disponibles

### 1. `migrate-images.js`
**Propósito**: Migra imágenes de galería desde el bucket `imagenes-publicas` al bucket `galeria-imagenes`.

**Funcionalidades**:
- ✅ Conecta a MongoDB y MinIO
- ✅ Verifica y crea el bucket destino si no existe
- ✅ Lista imágenes en la base de datos que necesitan migración
- ✅ Copia archivos del bucket origen al destino
- ✅ Actualiza las URLs en la base de datos
- ✅ Proporciona un resumen detallado de la migración
- ✅ Maneja errores y proporciona logs detallados

**Uso**:
```bash
node scripts/migrate-images.js
```

### 2. `list-bucket-contents.js`
**Propósito**: Lista el contenido de los buckets para verificación.

**Funcionalidades**:
- 📋 Lista todos los archivos en `imagenes-publicas`
- 📋 Lista todos los archivos en `galeria-imagenes`
- 📊 Muestra tamaños de archivos
- 🔍 Búsqueda recursiva (incluye subcarpetas)

**Uso**:
```bash
node scripts/list-bucket-contents.js
```

### 3. `cleanup-old-bucket.js`
**Propósito**: Limpia el bucket origen después de una migración exitosa.

**Funcionalidades**:
- ⚠️ Solicita confirmación doble antes de eliminar
- 🗑️ Elimina todos los objetos del bucket origen
- 🗑️ Elimina el bucket origen completo
- 🛡️ Verificaciones de seguridad

**Uso**:
```bash
node scripts/cleanup-old-bucket.js
```

## Proceso de Migración Recomendado

### Paso 1: Verificar Estado Inicial
```bash
# Ver qué archivos existen en ambos buckets
node scripts/list-bucket-contents.js
```

### Paso 2: Ejecutar Migración
```bash
# Migrar imágenes del bucket origen al destino
node scripts/migrate-images.js
```

### Paso 3: Verificar Migración
```bash
# Verificar que los archivos se copiaron correctamente
node scripts/list-bucket-contents.js

# Verificar que las imágenes se muestran en el frontend
# Ir a la galería en la aplicación web
```

### Paso 4: Limpieza (Opcional)
```bash
# SOLO después de verificar que todo funciona correctamente
node scripts/cleanup-old-bucket.js
```

## Resultados de la Migración

### ✅ Migración Exitosa
Se migraron **4 imágenes** exitosamente:

| Imagen | Estado | Archivo Original | Archivo Destino |
|--------|--------|------------------|------------------|
| a | ✅ SUCCESS | `galeria/f5592e02-1296-4816-8e93-c5c5a442d529.png` | `galeria/f5592e02-1296-4816-8e93-c5c5a442d529.png` |
| aa | ✅ SUCCESS | `galeria/f0bc69f2-7e8e-42ba-908e-d9ee95490e33.png` | `galeria/f0bc69f2-7e8e-42ba-908e-d9ee95490e33.png` |
| prueba2 | ✅ SUCCESS | `galeria/0223b8f4-bf4e-4a7b-bdf6-3f75c56a0a0c.png` | `galeria/0223b8f4-bf4e-4a7b-bdf6-3f75c56a0a0c.png` |
| prueba3 | ✅ SUCCESS | `galeria/867cf1ae-c778-4c35-b6e8-97b39dc637d2.png` | `galeria/867cf1ae-c778-4c35-b6e8-97b39dc637d2.png` |

### 📊 Estado de Buckets

**Bucket `imagenes-publicas`** (10 archivos):
- 2 archivos en raíz (no relacionados con galería)
- 8 archivos en subcarpeta `galeria/` (4 migrados + 4 adicionales)

**Bucket `galeria-imagenes`** (15 archivos):
- 4 archivos migrados desde `imagenes-publicas/galeria/`
- 11 archivos existentes previamente

## Variables de Entorno Requeridas

Asegúrate de que tu archivo `.env` contenga:

```env
# MinIO Configuration
MINIO_ENDPOINT=tu-endpoint
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=tu-access-key
MINIO_SECRET_KEY=tu-secret-key

# Bucket Names
MINIO_BUCKET_PUBLIC=imagenes-publicas
MINIO_BUCKET_GALERY=galeria-imagenes

# MongoDB
MONGODB_URI=tu-mongodb-uri
```

## Notas Importantes

1. **Backup**: Siempre haz un backup antes de ejecutar scripts de migración
2. **Verificación**: Verifica que las imágenes se muestren correctamente en el frontend antes de limpiar
3. **Reversibilidad**: Una vez que ejecutes `cleanup-old-bucket.js`, la operación no es reversible
4. **Permisos**: Asegúrate de que el bucket destino tenga las políticas correctas configuradas

## Solución de Problemas

### Error: "Invalid endPoint : undefined"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de que el archivo `.env` esté en la ubicación correcta

### Error: "Bucket does not exist"
- El script creará automáticamente el bucket destino si no existe
- Verifica la conectividad con MinIO

### Error: "File not found in source bucket"
- Ejecuta `list-bucket-contents.js` para ver qué archivos existen realmente
- Verifica que los nombres de archivos en la base de datos coincidan con los del bucket