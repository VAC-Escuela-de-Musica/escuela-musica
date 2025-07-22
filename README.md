
# 🎵 Escuela de Música - Sistema de Gestión de Materiales

## 📋 Descripción General
Sistema completo para la gestión de materiales educativos, usuarios y recursos en escuelas de música. Incluye frontend moderno en React y backend robusto en Node.js/Express, con arquitectura modular, control de acceso por roles y almacenamiento seguro de archivos.

---

## 🏗️ Arquitectura de Alto Nivel

```
escuela-musica/
├── frontend/   # Aplicación React (Vite)
│   └── ...
├── backend/    # API REST Node.js/Express
│   └── ...
├── docs/       # Documentación y especificaciones
└── ...
```

### Diagrama Simplificado

```
[Usuario] ⇄ [Frontend React] ⇄ [Backend Express] ⇄ [MongoDB]
                                 ⇄ [MinIO Storage]
```

---

## 🖥️ Frontend
- **Framework:** React 18 + Vite
- **Estado global:** Context API, hooks personalizados
- **Ruteo:** React Router DOM
- **Estilos:** CSS modular
- **Testing:** Vitest + React Testing Library
- **Características:**
  - Gestión de materiales (listado, filtros, subida, descarga, eliminación)
  - Gestión de usuarios (solo admin)
  - Control de acceso por roles (usuario, profesor, admin)
  - Interfaz responsiva y accesible
  - Feedback visual avanzado (spinners, modales, snackbars)
  - Arquitectura modular y escalable

## ⚙️ Backend
- **Framework:** Node.js + Express
- **Base de datos:** MongoDB (Mongoose)
- **Autenticación:** JWT, control de roles
- **Almacenamiento:** MinIO (archivos)
- **Patrones:** Repository, Result, Singleton
- **Logging:** Winston, logs estructurados
- **Características:**
  - API RESTful para materiales, usuarios y archivos
  - Middlewares de validación, autenticación y logging
  - Control de acceso granular y validaciones exhaustivas
  - Setup inicial automático y configuración centralizada

---

## 🏅 Análisis profesional (2025-07-19)

### Fortalezas
- **Arquitectura modular y escalable** en frontend y backend
- **Responsabilidad única y separación de lógica** en cada módulo
- **Control de acceso y seguridad** robustos (JWT, roles, validaciones)
- **UX/UI profesional y accesible**
- **Patrones de diseño y buenas prácticas** en ambos stacks
- **Documentación y estructura clara**

### Oportunidades de mejora
- Centralizar helpers y configuraciones globales
- Aumentar cobertura de tests (unitarios e integración)
- Mejorar internacionalización (i18n)
- Robustecer validaciones y feedback de errores
- Completar documentación Swagger/OpenAPI en backend
- Automatizar despliegue y monitoreo

---

## 🚀 Instalación y uso rápido

### Prerrequisitos
```bash
node >= 16.0.0
npm >= 8.0.0
MongoDB >= 4.4
```

### Instalación Frontend
```bash
cd frontend
npm install
npm run dev
```

### Instalación Backend
```bash
cd backend
npm install
npm start
```



---

escuela-musica/
├── frontend/
│   ├── src/components/   # Componentes visuales y de layout
│   ├── src/hooks/        # Hooks personalizados
│   ├── src/pages/        # Vistas principales
│   ├── src/services/     # Acceso a API y lógica de negocio
│   ├── src/utils/        # Funciones auxiliares
│   └── ...
├── backend/
│   ├── src/config/       # Configuración de entorno, base de datos y MinIO
│   ├── src/constants/    # Constantes globales
│   ├── src/controllers/  # Lógica de rutas y controladores
│   ├── src/middlewares/  # Middlewares de autenticación, validación, logging y errores
│   ├── src/models/       # Modelos de datos (Mongoose)
│   ├── src/patterns/     # Patrones de diseño y utilidades
│   ├── src/repositories/ # Acceso a datos y lógica de persistencia
│   ├── src/routes/       # Definición de rutas
│   ├── src/schema/       # Esquemas de validación
│   ├── src/services/     # Lógica de negocio y servicios
│   ├── src/utils/        # Utilidades y helpers
│   └── logs/             # Archivos de logs
└── docs/                 # Documentación

## 📁 Estructura de carpetas

```
escuela-musica/
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Custom Hooks
│   │   ├── pages/           # Vistas principales
│   │   ├── services/        # Servicios de API
│   │   ├── utils/           # Utilidades generales
│   │   └── ...
│   ├── public/              # Assets públicos
│   └── dist/                # Build de producción
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de entorno, base de datos y MinIO
│   │   ├── constants/       # Constantes globales
│   │   ├── controllers/     # Lógica de rutas y controladores
│   │   ├── middlewares/     # Middlewares de autenticación, validación, logging y errores
│   │   ├── models/          # Modelos de datos (Mongoose)
│   │   ├── patterns/        # Patrones de diseño y utilidades
│   │   ├── repositories/    # Acceso a datos y lógica de persistencia
│   │   ├── routes/          # Definición de rutas
│   │   ├── schema/          # Esquemas de validación
│   │   ├── services/        # Lógica de negocio y servicios
│   │   ├── utils/           # Utilidades y helpers
│   │   └── ...
│   └── logs/                # Archivos de logs
├── docs/                    # Documentación
└── ...
```

---

## 📝 Documentación y contacto
- **Frontend:** Ver `frontend/README.md`
- **Backend:** Ver `backend/README.md`
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Contacto:** Equipo de desarrollo VAC-Escuela-de-Musica

---

## 📊 Estado del Proyecto
- **Fase actual:** Desarrollo activo y pruebas funcionales.
- **Roadmap:** Integración de nuevas funcionalidades, mejora de cobertura de tests y despliegue automatizado.
- **Issues y soporte:** Reporta problemas en el repositorio o contacta al equipo.

## 📜 Licencia
Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## ☁️ Despliegue y ejecución
- **Local:** Sigue los pasos de instalación rápida.
- **Producción:** Configura variables de entorno, utiliza PM2 o Docker para backend, y sirve el frontend con Nginx o similar.
- **Documentación técnica:** Ver carpeta `docs/` y archivos README específicos.

## 🆘 Soporte y contribución
- Para soporte técnico, abre un issue en GitHub.
- Para contribuir, revisa las guías en `CONTRIBUTING.md` y sigue el flujo de ramas (`dev`, `funcionalidad/*`).

---

*Última actualización: 21 de julio de 2025*

---


---

*Última actualización: 19 de julio de 2025*
