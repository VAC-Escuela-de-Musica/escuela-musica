

# NOMBRECOMPONENTE - Guía de Refactorización y Diseño

---


## Reglas para el uso de la plantilla y documentación

> **ADVERTENCIA:**
> Las siguientes reglas son de cumplimiento obligatorio. Siempre deben ser consultadas y respetadas antes de tomar cualquier decisión, registrar cambios o modificar archivos relacionados con la refactorización. Este apartado debe ser lo primero que se lea y considere al iniciar cualquier acción de refactorización o documentación.

1. **Registro de cambios:**
   - Todo cambio estructural, refactorización, migración, ajuste de props o integración debe registrarse en el changelog correspondiente (`NOMBRECOMPONENTE.changelog.md`).
   - El changelog debe actualizarse inmediatamente después de cada cambio relevante, siguiendo el formato tabla.

2. **Consultas y actualizaciones:**
   - Antes de modificar cualquier componente, la IA debe consultar y actualizar la guía de refactorización (`NOMBRECOMPONENTE.refactor-notes.md`), el changelog y la lista de archivos relacionados.
   - Si se agregan/eliminan dependencias, helpers o utilidades compartidas, actualizar la sección de archivos relacionados y dejar constancia en el changelog.

3. **Rellenado de documentos:**
   - La IA debe rellenar y mantener actualizados todos los documentos de la carpeta `docs-refactor/NOMBRECOMPONENTE/` (changelog, backup, checklist, props/api, etc.) durante todo el proceso de refactorización.
   - Los backups deben generarse antes de cambios mayores y nunca modificarse tras su creación.

4. **Referencia al template base:**
   - Todo archivo de refactorización generado debe incluir explícitamente la ruta del template base utilizado, preferentemente al inicio del archivo.

5. **Checklist y validación:**
   - Cada paso del checklist debe marcarse al completarse y reflejarse en la guía y changelog.
   - Validar funcionamiento y actualizar la documentación tras cada iteración relevante.

6. **Trazabilidad y auditoría:**
   - Mantener la trazabilidad de decisiones, dependencias y relaciones en la guía de refactorización.
   - Facilitar la auditoría futura asegurando que toda la documentación esté centralizada y actualizada.

---

> **TRAZABILIDAD DEL TEMPLATE:**
> Todo archivo de refactorización generado para un componente (por ejemplo, `AlumnoForm.refactor-notes.md`) debe incluir explícitamente la ruta del template base utilizado para su creación, por ejemplo:
> 
> _"Este documento sigue la guía base ubicada en: `docs-refactor/plantilla/refactor-notes.template.md`"_
> 
> Se recomienda colocar esta referencia al inicio del archivo o en la sección donde se especifiquen las reglas y buenas prácticas, para asegurar trazabilidad y facilitar futuras auditorías o actualizaciones de la metodología.

> **IMPORTANTE:** Cada vez que se inicie un proceso de refactorización utilizando esta plantilla, todos los documentos generados (changelog, backup, checklist, props/api, etc.) deben almacenarse en la carpeta raíz del proyecto (`escuela-musica/`) dentro de una subcarpeta con el formato `docs-refactor/NOMBRECOMPONENTE/` (por ejemplo: `docs-refactor/AlumnoForm/`). Esto centraliza la documentación de refactorización, facilita su consulta y permite su eliminación masiva cuando ya no sea necesaria. No dejes estos archivos en la carpeta de componentes ni dispersos en el proyecto.

> Ejemplo de estructura:
> 
> escuela-musica/
> ├─ docs-refactor/
> │    ├─ AlumnoForm/
> │    │    ├─ AlumnoForm.changelog.md
> │    │    ├─ AlumnoForm.backup.jsx
> │    │    ├─ AlumnoForm.refactor-notes.md
> │    │    ├─ AlumnoForm.integration-checklist.md
> │    │    └─ AlumnoForm.props.md
> ├─ src/
> │   └─ components/
> │       └─ AlumnoForm/
> │           └─ ...

---


## 1. Documentos Relacionados y Rutas Importantes

- `NOMBRECOMPONENTE.changelog.md`: Registro cronológico de todos los cambios y refactorizaciones.
- `NOMBRECOMPONENTE.backup.jsx`: Backup de seguridad del componente antes de limpiezas o refactorizaciones mayores.
- **Archivos/Componentes Relacionados:** Enumera aquí todos los archivos, subcomponentes, hooks, servicios, helpers, utilidades compartidas (por ejemplo, helpers de formateo, validadores, etc.), estilos y tests que interactúan directamente con el componente principal. Incluye también componentes padres, listas, vistas o módulos que consumen, orquestan o dependen directamente de este componente (por ejemplo: listas, páginas, dashboards, etc.). Mantén esta lista actualizada para asegurar trazabilidad y evitar cambios aislados.

> **Nota sobre utilidades compartidas:**
> Si existen helpers, utilidades o módulos de lógica (por ejemplo, funciones de formateo, validadores, etc.) que son usados por varios componentes, documenta su existencia y uso en esta sección. Si detectas duplicidad de lógica entre utilidades (por ejemplo, dos funciones similares para formatear un dato), centraliza la lógica en un solo archivo y actualiza los imports en todos los consumidores. Deja registro de este proceso en el changelog y checklist.

> Siempre revisar estos documentos y la lista de relacionados antes de realizar cambios estructurales, para mantener la trazabilidad y la integridad del desarrollo.

---

## 2. Flujo de Trabajo Sugerido

1. **Antes de modificar cualquier componente:**
   - Consultar y actualizar el changelog, la guía de refactorización y la lista de relacionados.
   - Hacer backup si el cambio es mayor.
2. **Durante la implementación:**
   - Seguir el checklist de la guía.
   - Registrar cada cambio relevante en el changelog (con fecha, hora y segundos).
   - Actualizar la lista de relacionados si se agregan/eliminan dependencias.
3. **Después de la implementación:**
   - Marcar los pasos cumplidos en la guía.
   - Validar funcionamiento, accesibilidad y pruebas (incluyendo los relacionados).
   - Eliminar código obsoleto y mantener solo la versión modularizada.

---

## 3. Resumen General
- Breve descripción del propósito y alcance del componente y cómo se relaciona/interactúa con otros módulos.

## 4. Principios y Buenas Prácticas
- Single Responsibility Principle.
- Separation of Concerns.
- Reusabilidad.
- Accesibilidad.
- Escalabilidad.
- **Trazabilidad:** Documentar dependencias y relaciones.
- **Cobertura:** Considerar lógica, UI, helpers, hooks, servicios y pruebas.

## 5. Sugerencia de Estructura Modular

### Carpeta: `components/NOMBRECOMPONENTE/`
- `NOMBRECOMPONENTE.jsx` (componente principal, orquestador)
- Subcomponentes según la lógica del componente
- `ErrorDialog.jsx` (si aplica)
- `validators.js` (validadores puros)
- `utils.js` (helpers y formateo)
- `constants.js` (listas de opciones, textos, etc)
- `NOMBRECOMPONENTE.module.css` (estilos modulares)
- **Archivos Relacionados:**
  - Otros componentes que lo consumen o a los que provee datos (ej: listas, formularios, modales, etc.)
  - Hooks personalizados usados o exportados
  - Servicios/API relacionados
  - Tests específicos

### Ejemplo de responsabilidades
- **NOMBRECOMPONENTE.jsx:** Estado global, submit, composición de subcomponentes, manejo de errores.
- Subcomponentes: Renderizan secciones, reciben props y callbacks.
- **ErrorDialog.jsx:** Modal de error reutilizable.
- **validators.js:** Validadores puros, sin dependencias de UI.
- **utils.js:** Funciones de formateo y helpers.
- **constants.js:** Listas de opciones, textos, etc.
- **Archivos Relacionados:** Documentar cómo y dónde se usan/interactúan.

## 6. Flujo de Datos y Comunicación
- El componente principal mantiene el estado global y pasa valores/handlers a subcomponentes.
- Cada subcomponente recibe props: valores, errores, onChange, etc.
- Validación centralizada antes de submit.
- Modal de error se muestra desde el componente principal.
- **Comunicación con componentes relacionados:** Explicar cómo se integran, qué props/handlers se comparten, y cómo se actualizan entre sí.

## 7. Observaciones y Mejoras Detectadas
- Enumera problemas actuales y oportunidades de mejora.
- **Impacto en relacionados:** Si un cambio afecta a otros componentes, documentar el alcance y la necesidad de pruebas cruzadas.

## 8. Pasos Sugeridos para Refactorización

- [ ] 1. Crear carpeta `NOMBRECOMPONENTE/` y mover el componente principal.
- [ ] 2. Extraer subcomponentes por sección.
- [ ] 3. Extraer validadores y utilidades a archivos aparte.
- [ ] 4. Unificar lógica de arrays y booleans.
- [ ] 5. Eliminar duplicidad de campos.
- [ ] 6. Mejorar accesibilidad y documentar props.
- [ ] 7. Modularizar estilos y constantes.
- [ ] 8. Revisar y actualizar todos los archivos/componentes relacionados, incluyendo componentes padres, listas o vistas que consumen o dependen de este componente.
- [ ] 9. Actualizar o crear pruebas unitarias/integración.
- [ ] 10. Registrar todos los cambios en el changelog.

---

## 9. ¿Cuándo crear archivos de seguimiento adicionales?

- **Changelog (`NOMBRECOMPONENTE.changelog.md`)**: Siempre que haya cambios estructurales, refactorizaciones, migraciones, cambios de props, integración con nuevos módulos, o cualquier ajuste relevante. Útil para equipos, proyectos a largo plazo o componentes críticos.
- **Backup (`NOMBRECOMPONENTE.backup.jsx`)**: Antes de refactorizaciones mayores, limpieza de código, migración de dependencias, o eliminación de lógica antigua. También antes de migraciones de versión de librerías/frameworks.
- **Guía de Refactorización (`NOMBRECOMPONENTE.refactor-notes.md`)**: Cuando el componente tiene múltiples subcomponentes, lógica compleja, o está muy acoplado a otros módulos. Útil para planificar, consensuar y dejar registro de la arquitectura y decisiones de diseño.
- **Checklist de Integración/Impacto (`NOMBRECOMPONENTE.integration-checklist.md`)**: Cuando el componente interactúa con muchos otros módulos, servicios, o tiene dependencias cruzadas. Útil para asegurar que todos los puntos de integración se revisan y testean tras cambios.
- **Documentación de Props/API (`NOMBRECOMPONENTE.props.md` o `.api.md`)**: Cuando el componente es reutilizable, exporta una API pública, o es consumido por otros equipos/proyectos. Útil para mantener la documentación de props, eventos, callbacks y contratos de integración.

---

## 10. Estrategias de documentación para cada archivo

- **Changelog:**
  - Estructura tipo tabla o lista cronológica.
  - Cada entrada debe tener: fecha, autor, motivo, resumen del cambio, archivos afectados, impacto esperado.
  - Ejemplo:
    | Fecha       | Autor   | Cambio                | Archivos         | Resumen/Impacto         |
    |-------------|---------|-----------------------|------------------|-------------------------|
    | 2025-07-21  | Juan    | Refactor props        | NOMBRECOMP...jsx | Mejora legibilidad      |

- **Backup:**
  - Solo guardar el código fuente previo a cambios mayores.
  - No modificar ni actualizar, solo restaurar si es necesario.

- **Guía de Refactorización:**
  - Mantener actualizada la estructura, checklist y observaciones.
  - Documentar decisiones de arquitectura, dependencias y flujos de datos.
  - Incluir sección de “Archivos Relacionados” y actualizarla tras cada cambio relevante.

- **Checklist de Integración/Impacto:**
  - Listar todos los módulos, servicios, hooks, estilos y tests que deben revisarse tras cambios.
  - Marcar con fecha y responsable cada punto revisado.
  - Ejemplo:
    - [x] Actualizar tests de integración (Juan, 2025-07-21)
    - [ ] Revisar estilos globales

- **Documentación de Props/API:**
  - Tabla con nombre, tipo, descripción, requerido/opcional, valor por defecto.
  - Ejemplo:
    | Prop      | Tipo     | Descripción           | Requerido | Default |
    |-----------|----------|-----------------------|-----------|---------|
    | onSubmit  | function | Callback de envío     | Sí        | —       |

> Crea estos archivos cuando el componente crece en complejidad, tiene impacto en otros módulos, o cuando el equipo lo requiera para trazabilidad y mantenibilidad.
> Revisa y actualiza estos archivos antes y después de cada cambio relevante.
> Fomenta que todo el equipo consulte y actualice estos documentos como parte del flujo de trabajo.

---
