# Documentos Relacionados y Rutas Importantes

- `AlumnoForm.changelog.md`: Registro cronológico de todos los cambios y refactorizaciones. Consultar antes y después de modificar el componente para entender la evolución y evitar duplicidad de trabajo.
  - Ruta: `frontend/src/components/AlumnoForm.changelog.md`
- `AlumnoForm.backup.jsx`: Backup de seguridad del componente antes de limpiezas o refactorizaciones mayores. Consultar o restaurar en caso de errores o para comparar versiones.
  - Ruta: `frontend/src/components/AlumnoForm.backup.jsx`

> Siempre revisar estos documentos antes de realizar cambios estructurales, para mantener la trazabilidad y la integridad del desarrollo.


# AlumnoForm.jsx - Guía de Refactorización y Diseño

## 1. Resumen General
- Componente React para agregar/editar alumnos (formulario extenso y validado).
- Usa Material UI (Dialog, Box, TextField, Select, etc).
- Modal centrado, padding/margen responsive, botón X para cerrar.
- Manejo robusto de errores (submodal).
- Puede operar en modo creación o edición.

## 2. Principios y Buenas Prácticas
- **Single Responsibility Principle:** Cada bloque debe tener una función clara (datos alumno, apoderado, clase, otros).
- **Separation of Concerns:** Lógica de validación, utilidades y presentación deben estar separadas.
- **Reusabilidad:** Subcomponentes reutilizables para secciones del formulario.
- **Accesibilidad:** Etiquetas, roles, aria, feedback visual.
- **Escalabilidad:** Fácil de extender con nuevos campos o reglas.

## 3. Sugerencia de Estructura Modular

### Carpeta: `components/AlumnoForm/`
- `AlumnoForm.jsx` (componente principal, orquestador)
- `AlumnoDatos.jsx` (subcomponente: datos del alumno)
- `ApoderadoDatos.jsx` (subcomponente: datos del apoderado)
- `ClaseDatos.jsx` (subcomponente: datos de clase)
- `OtrosDatos.jsx` (subcomponente: otros datos y observaciones)
- `ErrorDialog.jsx` (modal de error reutilizable)
- `validators.js` (todas las funciones de validación)
- `utils.js` (formateo de rut, fechas, arrays, etc)
- `constants.js` (listas de opciones, textos, etc)

### Ejemplo de responsabilidades
- **AlumnoForm.jsx:** Estado global, submit, composición de subcomponentes, manejo de errores.
- **AlumnoDatos.jsx:** Renderiza campos de alumno, recibe props y callbacks.
- **ApoderadoDatos.jsx:** Renderiza campos de apoderado.
- **ClaseDatos.jsx:** Renderiza campos de clase.
- **OtrosDatos.jsx:** Renderiza campos adicionales y observaciones.
- **ErrorDialog.jsx:** Modal de error reutilizable.
- **validators.js:** Validadores puros, sin dependencias de UI.
- **utils.js:** Funciones de formateo y helpers.
- **constants.js:** Listas de opciones, textos, etc.

## 4. Flujo de Datos y Comunicación
- `AlumnoForm` mantiene el estado global y pasa valores/handlers a subcomponentes.
- Cada subcomponente recibe props: valores, errores, onChange, etc.
- Validación centralizada antes de submit.
- Modal de error se muestra desde el componente principal.

## 5. Observaciones y Mejoras Detectadas
- El formulario actual es muy largo y difícil de mantener.
- Hay duplicidad de campos (ej: RRSS, conocimientosPrevios).
- Lógica de arrays y booleans repetida.
- El modal de error está bien aislado.
- El botón X es intuitivo y funcional.
- Padding y margen bien adaptados a móvil y desktop.

## 6. Pasos Sugeridos para Refactorización
1. Crear carpeta `AlumnoForm/` y mover el componente principal.
2. Extraer subcomponentes por sección (ver punto 3).
3. Extraer validadores y utilidades a archivos aparte.
4. Unificar lógica de arrays y booleans.
5. Eliminar duplicidad de campos.
6. Mejorar accesibilidad y documentar props.
7. Modularizar estilos y constantes.

## 7. Referencias de Patrones y Buenas Prácticas
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [React Component Patterns](https://react.dev/learn/component-patterns)
- [Material UI Best Practices](https://mui.com/material-ui/guides/composition/)

---

_Este archivo sirve como guía estructurada y referencia rápida para futuras consultas y para planificar la refactorización del componente AlumnoForm._

## Flujo de Datos
- Recibe `initialData`, `onSubmit`, `onClose` como props.
- Al enviar, une día y hora en campo `clase` y normaliza teléfonos.
- Llama a `onSubmit` con los datos procesados.
- Si hay error, muestra modal de error.

## Puntos de Refactorización Futuros
- Separar en subcomponentes: DatosAlumno, DatosApoderado, OtrosDatos, DatosClase.
- Extraer validadores y utilidades a archivos aparte.
- Mejorar manejo de errores y feedback visual.
- Unificar lógica de arrays y booleans.
- Mejorar accesibilidad (labels, aria, etc).
- Revisar duplicidad de campos (ej: RRSS, conocimientosPrevios aparecen dos veces).
- Modularizar estilos y constantes.

## Observaciones de Código
- El formulario es muy largo, lo que dificulta el mantenimiento.
- Hay lógica repetida para arrays y booleans.
- El modal de error está bien aislado.
- El botón X funciona como cancelar.
- El padding y margen están bien adaptados a móvil y desktop.

## Sugerencias para la Refactorización
- Crear carpeta `components/AlumnoForm/` y dividir en subcomponentes.
- Crear archivo `validators.js` y `utils.js` para lógica de validación y formateo.
- Usar context o hooks personalizados si la lógica crece.
- Documentar props y flujos de datos.

---

_Este archivo sirve como guía rápida para futuras consultas y para planificar la refactorización del componente AlumnoForm._
