# Usuarios de Prueba para el Sistema

## Credenciales de Acceso

### 👤 Usuario Regular
- **Email:** user@email.com
- **Contraseña:** user123
- **Rol:** user
- **Permisos:** Solo puede ver materiales públicos

### 👨‍🏫 Profesor
- **Email:** profesor@email.com
- **Contraseña:** profesor123
- **Rol:** profesor
- **Permisos:** 
  - Puede ver materiales públicos
  - Puede subir materiales privados
  - Puede ver sus propios materiales privados
  - Puede eliminar sus propios materiales

### 👨‍💼 Administrador
- **Email:** admin@email.com
- **Contraseña:** admin123
- **Rol:** admin
- **Permisos:**
  - Puede ver todos los materiales (públicos y privados)
  - Puede subir materiales
  - Puede eliminar cualquier material
  - Acceso completo al sistema

## Comportamiento Esperado por Rol

### Usuario Regular (user)
- ✅ Ve solo materiales públicos
- ❌ No ve botón "Subir Material" en navegación
- ❌ No ve botones "Eliminar" en lista de materiales
- ❌ No puede acceder a /subir-material

### Profesor 
- ✅ Ve materiales públicos + sus materiales privados
- ✅ Ve botón "Subir Material" en navegación
- ✅ Ve botón "Eliminar" solo en sus propios materiales
- ✅ Puede subir materiales públicos y privados

### Administrador
- ✅ Ve todos los materiales
- ✅ Ve botón "Subir Material" en navegación  
- ✅ Ve botón "Eliminar" en todos los materiales
- ✅ Acceso completo a todas las funciones

## Notas
- Los usuarios se crean automáticamente al iniciar el backend por primera vez
- Si ya existe una base de datos con usuarios, estos usuarios de prueba no se crearán automáticamente
