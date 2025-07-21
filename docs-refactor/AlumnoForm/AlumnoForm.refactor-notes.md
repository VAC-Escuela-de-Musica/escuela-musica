# AlumnoForm - Guía de Refactorización

## Observaciones iniciales

# AlumnoForm - Guía de Refactorización

## Observaciones iniciales
- Refactorización iniciada el 2025-07-21 siguiendo la plantilla estándar.
- Se crea backup y estructura de documentación.
- Se identifican archivos principales y dependencias.

## Archivos/Componentes Relacionados
- `AlumnoForm.jsx` (componente principal)
- `AlumnoDatos.jsx`, `ApoderadoDatos.jsx`, `ClaseDatos.jsx`, `OtrosDatos.jsx` (subcomponentes)
- `validators.js` (validadores puros)
- `utils.js` (helpers y formateo)
- `constants.js` (listas de opciones, textos, etc)
- `ErrorDialog.jsx` (modal de error reutilizable)
- `AlumnoForm.module.css` (estilos modulares)
- **Consumidores:** `AlumnosList.jsx` (importa y usa AlumnoForm), `AlumnosPage.jsx` (renderiza AlumnosList), servicios de alumnos, tests relacionados

## Integración y dependencias
- `AlumnosList.jsx` importa `AlumnoForm` desde `./AlumnoForm/AlumnoForm`.
- `AlumnosPage.jsx` importa `AlumnosList` desde `../components/AlumnosList`.
- Cambios en la API de props de `AlumnoForm` impactan en `AlumnosList.jsx`.

## Checklist
- [x] Revisar consumidores directos de AlumnoForm

## Decisiones y pasos
- Se detecta duplicidad en la validación de fecha en `validators.js` (dos veces `fechaIngreso`).
- Se recomienda unificar la validación y documentar cualquier ajuste.

## Checklist
- [x] Crear carpeta y archivos de documentación
- [x] Hacer backup del componente
- [x] Identificar y documentar archivos relacionados
- [x] Unificar validadores duplicados
- [x] Actualizar imports en consumidores
- [x] Validar funcionamiento tras refactor
