# Ejemplos de Uso del Componente UnauthorizedAccess

Este archivo muestra cómo implementar el componente `UnauthorizedAccess` en diferentes módulos según las restricciones de roles del backend.

## Importación Base

```jsx
import UnauthorizedAccess from '../common/UnauthorizedAccess.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
```

## 1. Módulos Solo para Administradores

### UserManager, Gestión de Roles, Estudiantes

```jsx
// En UserManager.jsx, RoleManager.jsx, AlumnosList.jsx
const { isAdmin } = useAuth();

if (!isAdmin()) {
  return (
    <UnauthorizedAccess 
      message="Solo administradores pueden gestionar usuarios/roles/estudiantes."
      suggestion="Contacta al administrador si necesitas permisos."
    />
  );
}
```

### Mensajería Interna

```jsx
// En MensajeriaManager.jsx
const { isAdmin } = useAuth();

if (!isAdmin()) {
  return (
    <UnauthorizedAccess 
      title="Área Restringida"
      message="Solo administradores pueden acceder al sistema de mensajería interna."
      suggestion="Si necesitas enviar mensajes, contacta al administrador."
    />
  );
}
```

## 2. Módulos para Administradores y Profesores

### Materiales (ya implementado)

```jsx
// En RepositorioProfesor.jsx (ya implementado)
const { isStudent } = useAuth();

if (isStudent()) {
  return (
    <UnauthorizedAccess 
      message="Solo profesores y administradores pueden acceder al repositorio de materiales."
      suggestion="Si necesitas acceso a materiales, contacta a tu profesor."
    />
  );
}
```

### Gestión de Profesores (Lista de Activos)

```jsx
// En ProfesoresList.jsx o módulo similar
const { isStudent } = useAuth();

if (isStudent()) {
  return (
    <UnauthorizedAccess 
      message="Solo profesores y administradores pueden ver la lista de profesores."
      suggestion="Si necesitas contactar a un profesor, consulta con administración."
    />
  );
}
```

## 3. Módulos para Administradores y Asistentes

### Configuración de Email

```jsx
// En EmailConfig.jsx, GmailConfig.jsx
const { isAdmin, isAssistant } = useAuth();

if (!isAdmin() && !isAssistant()) {
  return (
    <UnauthorizedAccess 
      title="Configuración Restringida"
      message="Solo administradores y asistentes pueden configurar el sistema de email."
      suggestion="Contacta al administrador para cambios de configuración."
      color="error"
    />
  );
}
```

## 4. Módulos Públicos (Sin Restricciones)

### Contenido Web Público
- Carousel
- Galería pública  
- Testimonios
- Cards de profesores

Estos módulos NO necesitan el componente UnauthorizedAccess.

## 5. Variaciones del Componente

### Con Icono Personalizado

```jsx
import SecurityIcon from '@mui/icons-material/Security';

<UnauthorizedAccess 
  title="Área de Seguridad"
  message="Acceso restringido por políticas de seguridad."
  icon={<SecurityIcon fontSize="large" />}
  color="error"
/>
```

### Con Color Personalizado

```jsx
<UnauthorizedAccess 
  message="Solo personal autorizado."
  color="error" // warning (default), error, info, success
/>
```

## Módulos Identificados que Necesitan Restricciones

### Solo Admin:
- UserManager.jsx
- RoleManager.jsx (si existe)
- AlumnosList.jsx
- MensajeriaManager.jsx (mensajes internos)
- Gestión completa de profesores

### Admin + Profesor:
- RepositorioProfesor.jsx ✅ (ya implementado)
- Lista de profesores activos

### Admin + Asistente:
- EmailConfig.jsx
- GmailConfig.jsx
- WhatsAppConfig.jsx (configuración)

### Sin Restricciones:
- Galería pública
- Carousel
- Testimonios
- Cards profesores
- Horarios públicos