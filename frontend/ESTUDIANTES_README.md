# Funcionalidad de Estudiantes

## Descripción

Esta funcionalidad permite a los estudiantes acceder a su área exclusiva dentro de la plataforma, donde pueden ver información personal, materiales de estudio, horarios y más.

## Rutas

### Públicas
- `/login-estudiante` - Página de login específica para estudiantes
- `/` - Página principal con enlaces al login de estudiantes

### Protegidas
- `/estudiante` - Dashboard exclusivo para estudiantes (requiere autenticación y rol de estudiante)

## Componentes

### StudentLogin.jsx
- Formulario de login específico para estudiantes
- Verifica que el usuario tenga rol de estudiante
- Redirige a `/estudiante` tras login exitoso
- Incluye enlace al login administrativo

### StudentDashboard.jsx
- Panel principal para estudiantes
- Muestra información personal del estudiante
- Lista materiales recientes
- Acciones rápidas (ver materiales, horarios)
- Próximas actividades

### StudentProtectedRoute.jsx
- Componente de protección de rutas para estudiantes
- Verifica autenticación y rol de estudiante
- Redirige a login apropiado si no cumple requisitos

## Flujo de Autenticación

1. **Acceso**: El estudiante accede a `/login-estudiante`
2. **Login**: Ingresa sus credenciales
3. **Verificación**: Se verifica que tenga rol de estudiante
4. **Redirección**: Si es válido, va a `/estudiante`
5. **Dashboard**: Ve su área exclusiva

## Integración con Backend

### Endpoints utilizados
- `POST /api/auth/login` - Login de usuarios
- `GET /api/auth/verify` - Verificación de usuario
- `GET /api/alumnos/user/:userId` - Datos específicos del alumno
- `GET /api/materials` - Lista de materiales

### Roles requeridos
- `student` o `estudiante` - Para acceso al área de estudiantes

## Características

### Seguridad
- Verificación de roles específicos
- Rutas protegidas
- Redirección automática según tipo de usuario

### UX/UI
- Interfaz específica para estudiantes
- Iconografía educativa
- Navegación intuitiva
- Información contextual

### Funcionalidades
- Dashboard personalizado
- Acceso a materiales
- Información de horarios
- Gestión de perfil

## Configuración

### Variables de entorno
- `VITE_API_URL` - URL del backend (ya configurada)

### Dependencias
- Material-UI para componentes
- React Router para navegación
- Context API para estado global

## Uso

### Para estudiantes
1. Ir a la página principal
2. Hacer clic en "Acceso Estudiantes" en el menú
3. Ingresar credenciales
4. Acceder al dashboard personalizado

### Para desarrolladores
1. Los componentes están en `src/components/domain/auth/`
2. Las páginas están en `src/pages/`
3. Las rutas están configuradas en `src/App.jsx`
4. La configuración de API está en `src/config/api.js`

## Extensibilidad

### Agregar nuevas funcionalidades
1. Crear componentes en `src/components/domain/students/`
2. Agregar rutas en `src/App.jsx`
3. Actualizar endpoints en `src/config/api.js`
4. Documentar en este README

### Personalización
- Modificar `StudentDashboard.jsx` para agregar nuevas secciones
- Actualizar `StudentLogin.jsx` para cambiar el diseño
- Ajustar `StudentProtectedRoute.jsx` para nuevos roles 