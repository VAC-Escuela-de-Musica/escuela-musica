# 🎼 Módulo de Gestión de Profesores

## 📋 Descripción

El módulo de gestión de profesores permite administrar la información completa de los profesores de la escuela de música. Este sistema incluye un CRUD completo con acceso administrativo restringido y un formulario específico con todos los campos requeridos.

## 🔐 Control de Acceso

- **Acceso Requerido**: Solo usuarios con rol de **administrador**
- **Autenticación**: JWT obligatorio en todas las operaciones
- **Autorización**: Middleware `requireAdmin` en todas las rutas

## 📝 Campos del Formulario

### Campos Obligatorios:
- **Nombre**: Texto (2-50 caracteres)
- **Apellidos**: Texto (2-100 caracteres)
- **RUT**: Formato chileno (12.345.678-9)
- **Email**: Email válido y único
- **Número**: Teléfono (9-15 dígitos, puede iniciar con +)
- **Contraseña**: Mínimo 6 caracteres
- **Sueldo**: Número positivo
- **Fecha de contrato**: Fecha no futura

### Campos Opcionales:
- **Estado**: Activo/Inactivo (por defecto: Activo)

## 🏗️ Arquitectura del Sistema

### Backend

#### Estructura de Archivos:
```
backend/src/features/profesor-management/
├── controllers/
│   └── profesores.controller.js      # Controladores CRUD
├── services/
│   └── profesores.service.js         # Lógica de negocio
├── routes/
│   └── profesores.routes.js          # Rutas con middleware de autorización
└── index.js                          # Exportaciones centralizadas
```

#### Modelo de Datos:
```javascript
{
  nombre: String (required),
  apellidos: String (required),
  rut: String (unique, required),
  email: String (unique, required),
  numero: String (required),
  password: String (hashed, required),
  sueldo: Number (required),
  fechaContrato: Date (required),
  activo: Boolean (default: true),
  roles: [String] (default: ['profesor'])
}
```

### Frontend

#### Estructura de Archivos:
```
frontend/src/
├── components/domain/profesores/
│   ├── ProfesorForm/
│   │   ├── ProfesorForm.jsx          # Formulario completo
│   │   └── index.js
│   └── ProfesoresList.jsx            # Lista con CRUD
├── pages/
│   └── ProfesoresPage.jsx            # Página principal
└── services/
    └── profesores.service.js         # Servicios de API
```

## 🚀 Endpoints de la API

### Base URL: `/api/profesores`

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `GET` | `/` | Obtener todos los profesores | Admin |
| `POST` | `/` | Crear nuevo profesor | Admin |
| `GET` | `/:id` | Obtener profesor por ID | Admin |
| `PUT` | `/:id` | Actualizar profesor | Admin |
| `DELETE` | `/:id` | Eliminar profesor | Admin |
| `GET` | `/email/:email` | Obtener profesor por email | Admin |
| `GET` | `/activos/lista` | Obtener profesores activos | Admin |
| `PUT` | `/:id/toggle-status` | Cambiar estado activo/inactivo | Admin |

## 🎯 Funcionalidades Implementadas

### ✅ CRUD Completo
- **Crear**: Formulario con validaciones completas
- **Leer**: Lista con búsqueda y filtros
- **Actualizar**: Edición inline con validaciones
- **Eliminar**: Confirmación antes de eliminar

### ✅ Validaciones
- **Frontend**: Validación en tiempo real con Material-UI
- **Backend**: Validación con Joi y Mongoose
- **RUT**: Formato chileno automático
- **Email**: Validación de formato y unicidad
- **Contraseña**: Hashing automático con bcrypt

### ✅ Seguridad
- **Autenticación**: JWT obligatorio
- **Autorización**: Solo administradores
- **Contraseñas**: Hashing con bcrypt
- **Validación**: Sanitización de inputs

### ✅ UX/UI
- **Responsive**: Diseño adaptativo
- **Feedback**: Mensajes de éxito/error
- **Loading**: Estados de carga
- **Confirmación**: Diálogos de confirmación

## 🛠️ Instalación y Configuración

### 1. Backend
```bash
cd backend
npm install
```

### 2. Frontend
```bash
cd frontend
npm install
```

### 3. Variables de Entorno
```env
# Backend (.env)
PORT=1230
DB_URL=mongodb://localhost:27017/escuela_musica
JWT_SECRET=tu_jwt_secret
JWT_REFRESH_SECRET=tu_refresh_secret

# Frontend (.env)
VITE_API_URL=http://146.83.198.35:1230
```

## 🧪 Pruebas

### Script de Pruebas Automatizadas
```bash
cd test
node test-profesores-crud.js
```

### Pruebas Manuales
1. **Login como administrador**
2. **Navegar a `/dashboard/profesores`**
3. **Probar todas las operaciones CRUD**

## 📱 Uso del Sistema

### 1. Acceso al Módulo
- Login como administrador
- Navegar a "Profesores" en el menú lateral
- URL: `/dashboard/profesores`

### 2. Crear Profesor
- Click en botón "Agregar" (+)
- Llenar formulario con datos requeridos
- Validaciones automáticas en tiempo real
- Click en "Crear"

### 3. Editar Profesor
- Click en icono de edición (✏️)
- Modificar campos necesarios
- Contraseña opcional en edición
- Click en "Actualizar"

### 4. Cambiar Estado
- Click en icono de visibilidad (👁️)
- Alterna entre activo/inactivo
- Confirmación automática

### 5. Eliminar Profesor
- Click en icono de eliminar (🗑️)
- Confirmar en diálogo
- Eliminación permanente

## 🔍 Búsqueda y Filtros

### Búsqueda por:
- Nombre
- Apellidos
- Email
- RUT

### Filtros:
- Estado (Activo/Inactivo)
- Fecha de contrato
- Rango de sueldo

## 📊 Características Técnicas

### Backend
- **Framework**: Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT
- **Validación**: Joi + Mongoose
- **Hashing**: bcrypt
- **Middleware**: Autorización personalizada

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Estado**: React Hooks
- **Rutas**: React Router v6
- **HTTP Client**: Axios
- **Validación**: Formularios controlados

## 🚨 Consideraciones de Seguridad

1. **Acceso Restringido**: Solo administradores
2. **Validación de Inputs**: Frontend y backend
3. **Hashing de Contraseñas**: bcrypt
4. **Tokens JWT**: Autenticación segura
5. **Sanitización**: Prevención de XSS
6. **Rate Limiting**: Protección contra ataques

## 🔧 Mantenimiento

### Logs del Sistema
```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend console
# Ver en DevTools del navegador
```

### Monitoreo
- **Health Check**: `/api/health`
- **Métricas**: Logs estructurados
- **Errores**: Manejo centralizado

## 📞 Soporte

Para reportar problemas o solicitar mejoras:
1. Revisar logs del sistema
2. Verificar permisos de usuario
3. Comprobar conectividad de red
4. Validar datos de entrada

---

**Desarrollado para la Escuela de Música** 🎼 