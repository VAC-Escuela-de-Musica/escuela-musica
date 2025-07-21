# NOMBRECOMPONENTE - Guía de Refactorización y Diseño

## Documentos Relacionados y Rutas Importantes

- `NOMBRECOMPONENTE.changelog.md`: Registro cronológico de todos los cambios y refactorizaciones. Consultar antes y después de modificar el componente para entender la evolución y evitar duplicidad de trabajo.
  - Ruta: `frontend/src/components/NOMBRECOMPONENTE.changelog.md`
- `NOMBRECOMPONENTE.backup.jsx`: Backup de seguridad del componente antes de limpiezas o refactorizaciones mayores. Consultar o restaurar en caso de errores o para comparar versiones.
  - Ruta: `frontend/src/components/NOMBRECOMPONENTE.backup.jsx`

> Siempre revisar estos documentos antes de realizar cambios estructurales, para mantener la trazabilidad y la integridad del desarrollo.

---

## 1. Resumen General
- Breve descripción del propósito y alcance del componente.

## 2. Principios y Buenas Prácticas
- Single Responsibility Principle.
- Separation of Concerns.
- Reusabilidad.
- Accesibilidad.
- Escalabilidad.

## 3. Sugerencia de Estructura Modular

### Carpeta: `components/NOMBRECOMPONENTE/`
- `NOMBRECOMPONENTE.jsx` (componente principal, orquestador)
- Subcomponentes según la lógica del componente
- `ErrorDialog.jsx` (si aplica)
- `validators.js` (validadores puros)
- `utils.js` (helpers y formateo)
- `constants.js` (listas de opciones, textos, etc)

### Ejemplo de responsabilidades
- **NOMBRECOMPONENTE.jsx:** Estado global, submit, composición de subcomponentes, manejo de errores.
- Subcomponentes: Renderizan secciones, reciben props y callbacks.
- **ErrorDialog.jsx:** Modal de error reutilizable.
- **validators.js:** Validadores puros, sin dependencias de UI.
- **utils.js:** Funciones de formateo y helpers.
- **constants.js:** Listas de opciones, textos, etc.

## 4. Flujo de Datos y Comunicación
- El componente principal mantiene el estado global y pasa valores/handlers a subcomponentes.
- Cada subcomponente recibe props: valores, errores, onChange, etc.
- Validación centralizada antes de submit.
- Modal de error se muestra desde el componente principal.

## 5. Observaciones y Mejoras Detectadas
- Enumera problemas actuales y oportunidades de mejora.

## 6. Pasos Sugeridos para Refactorización

- [ ] 1. Crear carpeta `NOMBRECOMPONENTE/` y mover el componente principal.
- [ ] 2. Extraer subcomponentes por sección.
- [ ] 3. Extraer validadores y utilidades a archivos aparte.
- [ ] 4. Unificar lógica de arrays y booleans.
- [ ] 5. Eliminar duplicidad de campos.
- [ ] 6. Mejorar accesibilidad y documentar props.
- [ ] 7. Modularizar estilos y constantes.

> **Nota:** Todos los cambios y detalles de implementación deben registrarse en el archivo `NOMBRECOMPONENTE.changelog.md` con fecha, motivo, resumen y archivos afectados. Este documento principal solo debe marcar el avance general y servir como guía de trabajo, no para registrar detalles de cambios.

---

_Este archivo sirve como guía rápida para futuras consultas y para planificar la refactorización del componente NOMBRECOMPONENTE. El registro detallado de cambios está en el changelog._

## Flujo de Trabajo Sugerido

1. Antes de modificar cualquier componente:
   - Consultar y actualizar el changelog y la guía de refactorización.
   - Hacer backup si el cambio es mayor.

2. Durante la implementación:
   - Seguir el checklist de la guía.
   - Registrar cada cambio relevante en el changelog (con fecha, hora y segundos).

3. Después de la implementación:
   - Marcar los pasos cumplidos en la guía.
   - Validar funcionamiento, accesibilidad y pruebas.
   - Eliminar código obsoleto y mantener solo la versión modularizada.

---
