

# 🎼 Frontend - Escuela de Música


## 📋 Descripción
Frontend profesional para la gestión de materiales educativos, usuarios y recursos de una escuela de música.
Construido con React 18, Vite y hooks personalizados.
Arquitectura modular, responsiva y orientada a roles (usuario, profesor, administrador).
Permite autenticación, subida y descarga de materiales, gestión de usuarios y control de acceso granular.
Interfaz moderna, accesible y con feedback visual avanzado.

---

## 🏗️ Arquitectura del Frontend

El frontend sigue una arquitectura basada en componentes reutilizables, hooks personalizados y separación clara de responsabilidades. Se emplea Context API para el manejo de estado global (autenticación y roles), React Router para el ruteo protegido y modularización estricta para escalabilidad.

### Diagrama Simplificado

```
[Usuario]
   │
   ▼
[App.jsx / Context API]
   │
   ├── [Rutas protegidas (ProtectedRoute)]
   │      ├── [DashboardLayout]
   │      │      ├── [ListaMateriales]
   │      │      ├── [MaterialFilters]
   │      │      └── [SubirMaterial / SubirMultiplesMateriales]
   │      └── [GestionUsuarios] (solo admin)
   └── [Login]
```

**Flujo principal:**
- El usuario accede a la app y se autentica (Login).
- El estado de sesión y roles se gestiona vía Context API y hooks.
- El ruteo y la visibilidad de vistas/acciones dependen del rol.
- Los componentes consumen servicios centralizados para interactuar con la API backend.

**Principios clave:**
- Separación de lógica de negocio (hooks/services) y presentación (componentes).
- Modularidad y reutilización.
- Control de acceso y navegación protegida.

---


## 🧩 Componentes y organización
- **Framework:** React 18 + Vite
- **Ruteo:** React Router DOM
- **Estado global:** Context API (`AuthContextProvider`)
- **Estilos:** CSS modular y componentes estilizados
- **Testing:** Vitest + React Testing Library
- **Build:** Vite
- **Organización:**
  - `components/`: Componentes visuales y de layout reutilizables
    - **DashboardLayout:** Estructura de navegación y layout principal.
    - **ListaMateriales:** Listado de materiales con vistas grid/lista, paginación, acciones y previsualización.
    - **GestionUsuarios:** Panel de administración de usuarios (solo admin).
    - **MaterialFilters:** Filtros avanzados y estadísticas para materiales.
    - **SubirMaterial/SubirMultiplesMateriales:** Formularios para subir uno o varios materiales, con validación y progreso.
    - **ImageViewer:** Modal avanzado para previsualizar imágenes.
    - **ThemeToggle:** Alternancia de tema claro/oscuro.
    - **ProtectedRoute:** Protección de rutas según autenticación y rol.
    - **Login:** Formulario de autenticación.
    - **DataList:** Componente genérico para listados reutilizables.
  - `hooks/`: Hooks personalizados para lógica de negocio y UI
    - **useAuth:** Manejo de autenticación, usuario y roles.
    - **useMaterials:** Lógica de materiales (CRUD, filtros, paginación, subida, etc.).
    - **useUsers:** Lógica de usuarios y estadísticas.
    - **useTheme:** Control de tema claro/oscuro.
  - `pages/`: Vistas principales (Login, Dashboard, Upload)
    - **LoginPage:** Página de login con redirección inteligente.
    - **DashboardPage:** Página principal con listado de materiales.
    - **UploadPage:** Página para subir materiales.
  - `services/`: Acceso a API y lógica de negocio
    - **api.service:** Abstracción de todas las llamadas HTTP, subida/descarga de archivos, manejo de errores y reintentos.
    - **auth.service:** Lógica de autenticación, manejo de token, roles y sesión.
  - `utils/`: Helpers y utilidades
    - **logger:** Logger inteligente, configurable por entorno.
    - **helpers:** Formato de fechas, tamaños, tipos de archivo, etc.
    - **cache:** Sistema de cache avanzado con TTL y patrones de invalidación.

---

## ⚙️ Funcionamiento general
- **Autenticación:** Login seguro, persistencia de sesión, roles y control de acceso a vistas y acciones.
- **Gestión de materiales:** Listado, búsqueda, filtrado, subida (drag & drop), descarga y eliminación según permisos.
- **Gestión de usuarios:** Solo para administradores, permite CRUD y asignación de roles.
- **Interfaz:** Layout responsivo, navegación protegida, feedback visual (spinners, snackbars, modales), accesibilidad básica.
- **Internacionalización:** Actualmente solo en español, pero preparado para i18n.
- **Performance:** Uso de hooks, memoización y cache para optimizar renderizados y llamadas a API.

---

## 🏅 Análisis profesional y puntuación (2025-07-19)

### Puntuación general
- **Arquitectura y modularidad:** ⭐⭐⭐⭐⭐ (5/5)
- **Responsabilidad única y separación de lógica:** ⭐⭐⭐⭐⭐ (5/5)
- **UX/UI y accesibilidad:** ⭐⭐⭐⭐✰ (4.5/5)
- **Control de acceso y seguridad:** ⭐⭐⭐⭐⭐ (5/5)
- **Reutilización y extensibilidad:** ⭐⭐⭐⭐⭐ (5/5)
- **Documentación y mantenibilidad:** ⭐⭐⭐⭐✰ (4/5)
- **Testing y cobertura:** ⭐⭐⭐✰✰ (3.5/5)
- **Internacionalización:** ⭐⭐⭐✰✰ (3/5)

### Fortalezas principales
- **Modularidad:** Componentes y hooks bien segmentados y reutilizables.
- **Responsabilidad única:** Cada pieza cumple una función clara y desacoplada.
- **UX/UI profesional:** Layout responsivo, navegación protegida, feedback visual y modales claros.
- **Acceso basado en roles:** Lógica de visibilidad y acciones según permisos (admin, profesor, usuario).
- **Hooks personalizados:** Separación de lógica de negocio y presentación.
- **Manejo de estado y side effects:** Uso correcto de useState, useEffect, useContext.
- **Accesibilidad y usabilidad:** Botones, modales y navegación accesibles.
- **Performance:** Uso de cache, memoización y optimización de renders en listas.

---

### 🛠️ Posibles mejoras a implementar
- **Centralización de constantes y helpers:** Unificar helpers y configuraciones globales en `utils/` o `config/`.
- **Aumentar test coverage:** Agregar más pruebas unitarias y de integración, especialmente en hooks y componentes críticos.
- **Internacionalización:** Implementar soporte multilenguaje (i18n) para escalar a otros idiomas.
- **Documentación:** Mejorar comentarios, ejemplos de uso y guías de integración para cada componente y hook.
- **Accesibilidad avanzada:** Mejorar roles ARIA, navegación por teclado y foco en modales.
- **Validaciones:** Robustecer validaciones de formularios y subida de archivos.
- **Integración con sistemas externos:** Considerar integración con sistemas de monitoreo/logging y cache reactivo (SWR/React Query).
- **Optimización de performance:** Revisar memoización y renderizado en listas grandes y vistas con muchos elementos.

---

## 🚀 Instalación y uso

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Estructura de carpetas

- `src/components/` - Componentes visuales y de layout
- `src/hooks/` - Hooks personalizados
- `src/pages/` - Vistas principales
- `src/services/` - Acceso a API y lógica de negocio
- `src/utils/` - Funciones auxiliares

---

## 🧑‍💻 Contacto y soporte
Para dudas o mejoras, contacta al equipo de desarrollo.