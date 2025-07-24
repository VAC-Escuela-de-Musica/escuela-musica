# Funcionalidades Pendientes - Escuela de Música

## ❌ Testimonios (FALTA IMPLEMENTAR)

**Problema:** El frontend intenta acceder a `/api/testimonios` pero la ruta no existe en el backend.

**Error:** `GET http://localhost/api/testimonios 404 (Not Found)`

**Estado:** Sin implementar

**Asignado a:** Otro compañero del equipo

### Descripción
El componente `TestimoniosManager.jsx` está intentando cargar testimonios desde la API, pero la funcionalidad completa no existe en el backend. Necesita implementarse siguiendo el patrón de otros módulos del proyecto.

### Lo que falta implementar:

#### 1. Estructura de archivos
```
backend/src/features/website-content/
├── controllers/
│   └── testimonios.controller.js
├── services/
│   └── testimonios.service.js
└── routes/
    └── testimonios.routes.js
```

#### 2. Endpoints necesarios
- `GET /api/testimonios` - Listar todos los testimonios
- `GET /api/testimonios/:id` - Obtener testimonio por ID
- `POST /api/testimonios` - Crear nuevo testimonio (admin)
- `PUT /api/testimonios/:id` - Actualizar testimonio (admin)
- `DELETE /api/testimonios/:id` - Eliminar testimonio (admin)

#### 3. Modelo de datos sugerido
```javascript
{
  _id: ObjectId,
  nombre: String,
  mensaje: String,
  imagen: String, // URL opcional
  activo: Boolean,
  fechaCreacion: Date,
  fechaActualizacion: Date
}
```

#### 4. Integración
- Registrar rutas en `src/routes/index.routes.js`
- Usar middlewares existentes de autenticación y validación
- Seguir patrones de `carousel.routes.js` y `cardsProfesores.routes.js`

---

## Otros pendientes
_(Agregar aquí otras funcionalidades faltantes cuando se encuentren)_