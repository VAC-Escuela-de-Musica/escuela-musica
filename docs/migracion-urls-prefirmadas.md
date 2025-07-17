# Migración a Sistema de URLs Pre-firmadas

## Información para Desarrolladores y Administradores

Este documento describe la migración del sistema de gestión de materiales educativos a un enfoque basado exclusivamente en URLs pre-firmadas.

## ¿Qué son las URLs Pre-firmadas?

Las URLs pre-firmadas permiten acceso temporal y controlado a objetos en un bucket MinIO/S3, sin necesidad de que los archivos pasen por el servidor Node.js, mejorando significativamente la escalabilidad y rendimiento del sistema.

## Beneficios de la Migración

- **Mayor Escalabilidad**: Los archivos se transfieren directamente desde el navegador al almacenamiento.
- **Mejor Rendimiento**: Reduce la carga en el servidor Node.js.
- **Seguridad Mejorada**: Acceso controlado con expiración temporal.
- **Mejor Auditoría**: Registro detallado de operaciones y accesos.
- **Sistema de Caché**: Optimiza la generación de URLs.

## Cambios Realizados

1. **Unificación de Rutas**: 
   - Nuevo endpoint principal: `/api/materials/`
   - Endpoint legacy (mantenido temporalmente): `/api/materiales/`

2. **Nuevos Endpoints**:
   - `POST /api/materials/upload-url`: Generar URL para subir archivo
   - `POST /api/materials/confirm-upload`: Confirmar subida exitosa
   - `GET /api/materials/download-url/:id`: Obtener URL para descargar
   - `GET /api/materials/`: Listar materiales con URLs de descarga
   - `DELETE /api/materials/:id`: Eliminar material

3. **Servicio Frontend Actualizado**:
   - `presignedMaterialService.js`: Servicios para interactuar con la nueva API

## Cómo Ejecutar la Migración

Para migrar los materiales existentes al nuevo sistema:

```bash
# Verificar qué materiales necesitan migración (no realiza cambios)
npm run migrate:check

# Ejecutar la migración automática
npm run migrate:presigned

# Si es necesario revertir la migración
npm run migrate:rollback

# Para materiales que necesiten migración manual (sin ruta definida)
npm run migrate:manual 68794a49e00529004d367b9f
```

### Migración Manual

Si encuentras errores como "Archivo original no existe en MinIO", deberás:

1. Usar el comando `migrate:manual <ID>` para preparar el material
2. Subir el archivo manualmente utilizando la nueva API de URLs prefirmadas
3. Una vez subido, confirmar la subida mediante la API

## Proceso de Subida

1. Frontend solicita URL pre-firmada al backend
2. Backend genera URL con permisos temporales
3. Frontend sube el archivo directamente a MinIO/S3
4. Frontend notifica al backend que la subida fue exitosa
5. Backend verifica y registra el material en la base de datos

## Proceso de Descarga

1. Frontend solicita URL de descarga
2. Backend verifica permisos y genera URL temporal
3. Frontend redirecciona al usuario a la URL para descarga directa

## Recomendaciones

- Se recomienda eliminar el sistema legacy después de completar la migración
- Para ajustar tiempos de expiración de URLs, modificar los parámetros en `presignedOnly.controller.js`
- Considerar implementar Redis en producción para el caché de URLs

## Próximos Pasos

1. Completar pruebas exhaustivas con el nuevo sistema
2. Migrar todos los materiales existentes
3. Eliminar código legacy después de confirmar estabilidad

Para cualquier consulta, contactar al equipo de desarrollo.
