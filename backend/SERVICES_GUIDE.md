# 📚 Guía de Uso - Servicios Estandarizados

## 🎯 Introducción

Todos los servicios del sistema ahora utilizan **BaseService** para garantizar consistencia y reutilización de código. Esta guía muestra cómo usar y extender los servicios.

## 🏗️ Arquitectura

### Formato de Respuesta Estandarizado

Todos los servicios retornan el mismo formato:

```javascript
{
  success: boolean,    // true si la operación fue exitosa
  data: any,          // Datos de la respuesta (null si error)
  error: string|null, // Mensaje de error (null si exitoso)
  pagination?: {      // Solo en consultas con paginación
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## 📋 Servicios Disponibles

### 1. UserService
```javascript
import { UserService } from '../services/index.js';

// Obtener todos los usuarios
const result = await UserService.getUsers();
if (result.success) {
  console.log('Usuarios:', result.data);
}

// Crear usuario
const newUser = await UserService.createUser({
  username: 'juan',
  email: 'juan@ejemplo.com',
  password: 'password123',
  roles: ['estudiante']
});
```

### 2. MaterialService
```javascript
import { MaterialService } from '../services/index.js';

// Buscar materiales públicos
const publicMaterials = await MaterialService.findPublicMaterials({
  page: 1,
  limit: 10
});

// Buscar por categoría
const pianoMaterials = await MaterialService.findByCategoria('piano');

// Incrementar descargas
await MaterialService.incrementDownloadCount(materialId);
```

### 3. ClassService
```javascript
import { ClassService } from '../services/index.js';

// Obtener clases por profesor
const classes = await ClassService.findByProfesor(profesorId);

// Agregar estudiante a clase
await ClassService.addEstudiante(classId, estudianteId);

// Obtener estadísticas
const stats = await ClassService.getEstadisticas();
```

### 4. EventService
```javascript
import { EventService } from '../services/index.js';

// Obtener eventos futuros
const upcoming = await EventService.findUpcomingEvents();

// Buscar por rango de fechas
const events = await EventService.findByDateRange(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);

// Agregar participante
await EventService.addParticipante(eventId, participanteId);
```

## 🔧 Uso en Controladores

### Patrón Recomendado

```javascript
const getUsers = asyncHandler(async (req, res) => {
  const result = await UserService.getUsers();
  
  if (!result.success) {
    return respondError(req, res, 404, result.error);
  }

  return result.data.length === 0
    ? respondSuccess(req, res, 204)
    : respondSuccess(req, res, 200, result.data);
});
```

## 🚀 Crear Nuevo Servicio

### Plantilla Base

```javascript
"use strict";

import Model from "../../models/model.model.js";
import BaseService from "../base.service.js";
import { handleError } from "../../utils/errorHandler.util.js";

class NewService extends BaseService {
  constructor() {
    super(Model);
  }

  /**
   * Método específico del servicio
   * @param {any} param - Parámetro específico
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async customMethod(param) {
    try {
      // Lógica específica del servicio
      const result = await this.model.findOne({ field: param });
      
      return {
        success: true,
        data: result,
        error: null
      };
    } catch (error) {
      handleError(error, "NewService -> customMethod");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

const newService = new NewService();
export default newService;
```

## 🎯 Métodos Disponibles de BaseService

### CRUD Básico
- `findById(id, populate)` - Buscar por ID
- `findAll(filter, populate, options)` - Buscar con filtros
- `create(data)` - Crear nuevo documento
- `updateById(id, data)` - Actualizar por ID
- `deleteById(id)` - Eliminar por ID
- `findOne(filter, populate)` - Buscar uno con filtros

### Opciones de Paginación
```javascript
const options = {
  page: 1,        // Página actual
  limit: 10,      // Elementos por página
  sort: { createdAt: -1 }  // Ordenamiento
};
```

## ✅ Beneficios

1. **Consistencia**: Mismo formato de respuesta en toda la aplicación
2. **Reutilización**: Métodos CRUD comunes disponibles automáticamente
3. **Mantenibilidad**: Cambios en BaseService se propagan a todos los servicios
4. **Escalabilidad**: Fácil agregar nuevos servicios siguiendo el patrón
5. **Testing**: Comportamiento predecible para pruebas unitarias

## 🔍 Debugging

Para debug, todos los servicios registran errores automáticamente:

```javascript
// Los errores se registran automáticamente con contexto
handleError(error, "ServiceName -> methodName");
```

## 📊 Métricas

Los servicios incluyen métricas automáticas:
- Conteo de operaciones
- Tiempo de respuesta
- Errores registrados
- Uso de memoria

---

¿Necesitas ayuda con algún servicio específico? Consulta la documentación completa en `/docs/services/`.
