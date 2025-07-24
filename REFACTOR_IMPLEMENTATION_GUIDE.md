# Guía de Implementación de Refactorización 

## 🎯 Objetivo

Esta guía proporciona instrucciones paso a paso para que cualquier pueda continuar la refactorización del frontend de manera sistemática y controlada.

## 📋 Prerrequisitos

### Antes de Comenzar
1. **Leer completamente** `REFACTORIZATION_GUIDE.md`
2. **Verificar estado actual** consultando `REFACTOR_CHANGELOG.md`
3. **Confirmar que las pruebas existentes pasan**
4. **Crear respaldo** del código actual

### Herramientas Necesarias
- **Read/Write/Edit**: Para modificar archivos
- **Bash**: Para ejecutar pruebas y comandos
- **Grep/Glob**: Para buscar patrones de código
- **TodoWrite**: Para actualizar progreso

## 🔄 Flujo de Trabajo Estándar

### Para Cada Tarea:
1. **Actualizar `REFACTOR_CHANGELOG.md`** con inicio de tarea
2. **Implementar cambios** siguiendo las especificaciones
3. **Ejecutar pruebas** para verificar funcionalidad
4. **Documentar cambios** en changelog
5. **Marcar tarea como completada** en TodoWrite

### Comandos de Validación
```bash
# Antes de cada cambio
npm test                    # Ejecutar pruebas
npm run lint               # Verificar estilo de código
npm run build              # Confirmar que compila

# Después de cada cambio
npm test                    # Confirmar que no se rompió nada
npm run dev                # Verificar en desarrollo
```

---

## 📝 FASE 1: Consolidación y Limpieza

### Tarea 1.1: Eliminar Componentes Duplicados

#### Objetivo
Consolidar `UserManager.jsx` y `GestionUsuarios.jsx` en un solo componente.

#### Pasos de Implementación
```markdown
1. **Analizar diferencias**:
   - Leer `frontend/src/components/UserManager.jsx`
   - Leer `frontend/src/components/GestionUsuarios.jsx`
   - Identificar funcionalidades únicas de cada uno

2. **Crear componente consolidado**:
   - Mantener el más completo (UserManager.jsx)
   - Integrar funcionalidades únicas del otro
   - Actualizar imports en archivos que usen GestionUsuarios

3. **Eliminar archivo duplicado**:
   - Eliminar `GestionUsuarios.jsx`
   - Actualizar todas las referencias

4. **Validar**:
   - Ejecutar `npm test`
   - Verificar que la gestión de usuarios funciona
   - Confirmar que no hay imports rotos
```

#### Criterios de Éxito
- [ ] Solo existe un componente para gestión de usuarios
- [ ] Todas las funcionalidades están preservadas
- [ ] No hay errores de imports
- [ ] Las pruebas pasan

#### Código de Validación
```bash
# Verificar que no existen duplicados
find frontend/src -name "*GestionUsuarios*" -type f
# Debe retornar 0 archivos

# Verificar imports
grep -r "GestionUsuarios" frontend/src/
# No debe encontrar referencias
```

#### Registro en Changelog
```markdown
## [FASE-1.1] - AAAA-MM-DD
### ✅ Completado
- Consolidado UserManager.jsx y GestionUsuarios.jsx
- Eliminado componente duplicado
- Actualizados imports en X archivos

### 🔧 Archivos Modificados
- `frontend/src/components/UserManager.jsx` - Funcionalidades consolidadas
- `frontend/src/pages/DashboardPage.jsx` - Import actualizado
- `frontend/src/routes/index.js` - Referencia actualizada

### ✅ Validación
- Tests: ✅ PASSED
- Build: ✅ SUCCESS
- Lint: ✅ NO ERRORS
```

---

### Tarea 1.2: Unificar Variables de Entorno

#### Objetivo
Estandarizar todas las variables de API a una sola: `VITE_API_URL`

#### Pasos de Implementación
```markdown
1. **Identificar todas las variables**:
   - Buscar `VITE_API` en todo el proyecto
   - Listar todas las variantes encontradas

2. **Estandarizar a VITE_API_URL**:
   - Reemplazar `VITE_API_BASE_URL` por `VITE_API_URL`
   - Reemplazar `VITE_API_BASE` por `VITE_API_URL`
   - Actualizar `.env.example` si existe

3. **Actualizar todos los archivos**:
   - Usar herramienta Edit para reemplazar en cada archivo
   - Verificar que todas las URLs sean consistentes

4. **Validar**:
   - Ejecutar aplicación y verificar que las API calls funcionan
   - Confirmar que no hay errores de variable undefined
```

#### Búsqueda de Variables
```bash
# Encontrar todas las variables de API
grep -r "VITE_API" frontend/src/ --include="*.js" --include="*.jsx"

# Encontrar patrones de import.meta.env
grep -r "import\.meta\.env\.VITE_API" frontend/src/
```

#### Criterios de Éxito
- [ ] Solo existe `VITE_API_URL` en todo el proyecto
- [ ] Todas las API calls funcionan correctamente
- [ ] No hay errores de variables undefined

---

### Tarea 1.3: Eliminar CSRF Token Duplicado (NUEVO)

#### Objetivo
Centralizar la obtención del CSRF token en AuthContext únicamente, eliminando duplicación

#### Pasos de Implementación
```markdown
1. **Eliminar llamada CSRF de App.jsx**:
   - Remover import: `import { fetchCsrfToken } from "./config/api"`
   - Remover useEffect que llama fetchCsrfToken()

2. **Mejorar manejo CSRF en AuthContext.jsx**:
   - Reemplazar fetch manual por apiService
   - Mantener lógica de setCsrfToken()
   - Agregar mejor manejo de errores

3. **Validar que funciona correctamente**:
   - Solo una llamada al endpoint /csrf-token
   - Token disponible en todo el contexto
```

#### Código Antes/Después
```javascript
// ANTES - App.jsx (ELIMINAR)
import { fetchCsrfToken } from "./config/api";
useEffect(() => {
  fetchCsrfToken();
}, []);

// ANTES - AuthContext.jsx (fetch manual)
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/csrf-token`, {
  credentials: "include"
})

// DESPUÉS - Solo AuthContext.jsx (usando apiService)
const data = await apiService.get('/csrf-token');
setCsrfToken(data.csrfToken);
```

#### Criterios de Éxito
- [ ] Cero llamadas CSRF desde App.jsx
- [ ] Una sola llamada CSRF desde AuthContext
- [ ] Token CSRF disponible en toda la aplicación
- [ ] No hay errores de autenticación

### Tarea 1.4: Centralizar uso de api.service.js

#### Objetivo
Reemplazar todas las llamadas `fetch` manuales por el uso de `api.service.js`

#### Pasos de Implementación
```markdown
1. **Identificar fetch manuales**:
   - Buscar patrones `fetch(` en todo el frontend
   - Listar archivos que no usan api.service

2. **Reemplazar en cada archivo**:
   - Importar apiService: `import { apiService } from '../services/api.service.js'`
   - Reemplazar fetch manual por métodos de apiService
   - Mantener la misma funcionalidad

3. **Ejemplo de reemplazo**:
   ```javascript
   // ANTES
   const response = await fetch(`${API_URL}/users`, {
     headers: { Authorization: `Bearer ${token}` }
   });
   const data = await response.json();
   
   // DESPUÉS
   const data = await apiService.getUsers();
   ```

4. **Validar cada reemplazo**:
   - Ejecutar función específica
   - Confirmar que retorna los mismos datos
```

#### Búsqueda de Fetch Manuales
```bash
# Encontrar todos los fetch manuales
grep -r "fetch(" frontend/src/ --include="*.js" --include="*.jsx"

# Encontrar archivos que no importan apiService
grep -L "api.service" frontend/src/components/*.jsx
```

#### Criterios de Éxito
- [ ] Cero llamadas `fetch` manuales en components/
- [ ] Todos los componentes usan apiService
- [ ] Funcionalidad preservada al 100%

---

## 📝 FASE 2: Abstracción de Patrones

### Tarea 2.1: Crear Hook useCrudManager

#### Objetivo
Crear hook reutilizable que elimine duplicación en gestión CRUD

#### Especificación del Hook
```javascript
// hooks/useCrudManager.js
export const useCrudManager = (endpoint, itemName = 'item') => {
  // Estados
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogState, setDialogState] = useState({
    open: false,
    editing: null,
    formData: {}
  });

  // Operaciones CRUD
  const fetchItems = useCallback(async () => { /* implementar */ });
  const saveItem = useCallback(async (data) => { /* implementar */ });
  const deleteItem = useCallback(async (id) => { /* implementar */ });
  
  // Gestión de dialogs
  const openDialog = useCallback((item = null) => { /* implementar */ });
  const closeDialog = useCallback(() => { /* implementar */ });

  return {
    items, loading, error, dialogState,
    fetchItems, saveItem, deleteItem,
    openDialog, closeDialog
  };
};
```

#### Pasos de Implementación
```markdown
1. **Crear archivo `hooks/useCrudManager.js`**
2. **Implementar cada función**:
   - fetchItems: GET con manejo de errores
   - saveItem: POST/PUT según si existe editing
   - deleteItem: DELETE con confirmación
   - openDialog/closeDialog: gestión de estado del modal

3. **Probar con un componente**:
   - Elegir TestimoniosManager como prueba
   - Reemplazar lógica interna por hook
   - Validar que funciona idénticamente

4. **Documentar uso**:
   - Agregar JSDoc al hook
   - Crear ejemplo de uso
```

#### Criterios de Éxito
- [ ] Hook creado y funcionando
- [ ] Al menos 1 componente migrado exitosamente
- [ ] Reducción de código >50% en componente migrado
- [ ] Funcionalidad idéntica al original

---

### Tarea 2.2: Crear Componente DataManager

#### Objetivo
Componente reutilizable para cualquier gestión CRUD

#### Especificación del Componente
```javascript
// components/common/DataManager.jsx
export const DataManager = ({
  title,           // "Gestión de Usuarios"
  endpoint,        // "/users"  
  itemName,        // "usuario"
  FormComponent,   // UserForm
  columns,         // definición de columnas para tabla
  canEdit = true,
  canDelete = true,
  canCreate = true
}) => {
  const crud = useCrudManager(endpoint, itemName);
  
  return (
    <Box>
      <Typography variant="h4">{title}</Typography>
      {canCreate && <CreateButton onClick={() => crud.openDialog()} />}
      <DataTable 
        data={crud.items}
        columns={columns}
        loading={crud.loading}
        onEdit={canEdit ? crud.openDialog : null}
        onDelete={canDelete ? crud.deleteItem : null}
      />
      <FormDialog
        open={crud.dialogState.open}
        onClose={crud.closeDialog}
        FormComponent={FormComponent}
        data={crud.dialogState.formData}
        onSubmit={crud.saveItem}
      />
    </Box>
  );
};
```

#### Pasos de Implementación
```markdown
1. **Crear estructura base del componente**
2. **Crear subcomponentes necesarios**:
   - DataTable: tabla genérica con acciones
   - FormDialog: modal genérico para formularios
   - CreateButton: botón de crear

3. **Implementar props de configuración**:
   - columns: configuración flexible de columnas
   - permissions: control granular de operaciones

4. **Migrar primer componente**:
   - UserManager → usar DataManager
   - Crear UserForm como componente separado
   - Definir columns para usuarios

5. **Validar funcionalidad completa**
```

#### Criterios de Éxito
- [ ] Componente DataManager creado
- [ ] Subcomponentes (DataTable, FormDialog) funcionando
- [ ] Al menos 1 gestor migrado exitosamente
- [ ] Reducción de código >70% en gestor migrado

---

## 📝 FASE 3: Optimización de Estado

### Tarea 3.1: Mejorar AuthContext

#### Objetivo
Centralizar toda la lógica de autenticación y eliminar inconsistencias

#### Pasos de Implementación
```markdown
1. **Refactorizar AuthContext**:
   - Usar solo apiService para operaciones
   - Eliminar setTimeout artificial
   - Implementar auto-refresh de token

2. **Centralizar funciones de auth**:
   - login: mover desde Login.jsx al context
   - logout: consolidar implementaciones
   - verifyToken: automático al iniciar

3. **Actualizar componentes**:
   - Login.jsx: usar solo funciones del context
   - Eliminar lógica de auth duplicada
```

#### Criterios de Éxito
- [ ] AuthContext maneja 100% de operaciones de auth
- [ ] Cero lógica de auth fuera del context
- [ ] Auto-refresh funcionando

---

## 📝 FASE 4: Separación de Responsabilidades

### Tarea 4.1: Crear Services Específicos

#### Objetivo
Separar lógica de negocio de los componentes

#### Pasos de Implementación
```markdown
1. **Crear services por dominio**:
   - users.service.js
   - testimonios.service.js  
   - materiales.service.js

2. **Mover validaciones a services**:
   - Validación de datos antes de enviar
   - Transformación de respuestas
   - Lógica de negocio específica

3. **Actualizar componentes**:
   - Usar services en lugar de apiService directo
   - Componentes solo manejan UI
```

---

## 🚨 Manejo de Errores y Rollback

### Si algo sale mal:
```bash
# Revertir cambios
git reset --hard HEAD~1

# O restaurar archivo específico
git checkout HEAD~1 -- ruta/del/archivo.jsx

# Verificar estado
npm test
npm run build
```

### Checklist de Validación Universal
```markdown
Para cada cambio mayor:
- [ ] `npm test` pasa
- [ ] `npm run build` exitoso  
- [ ] `npm run lint` sin errores
- [ ] Funcionalidad manual verificada
- [ ] Changelog actualizado
- [ ] TodoWrite actualizado
```

---

## 📊 Métricas de Seguimiento

### Registrar en cada fase:
```markdown
## Métricas Fase X
- **Líneas de código eliminadas**: XXX
- **Componentes consolidados**: X → Y  
- **Tiempo de implementación**: X horas
- **Bugs encontrados**: X
- **Tests afectados**: X actualizados
```

---

## 🔄 Próximos Pasos al Completar

### Al terminar toda la refactorización:
1. **Ejecutar suite completa de pruebas**
2. **Actualizar documentación del proyecto**
3. **Crear guía de desarrollo con nuevos patrones**
4. **Marcar en changelog como completado**

### Para futuras mejoras:
1. **Implementar tests para componentes nuevos**
2. **Agregar TypeScript gradualmente**
3. **Optimizar performance con React.memo**
4. **Implementar Storybook para componentes**

---

*Esta guía debe seguirse paso a paso. Cada tarea debe completarse antes de pasar a la siguiente.*