import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const SRC_DIR = path.join(__dirname, 'frontend', 'src');
const ERRORS_FILE = path.join(__dirname, 'import-errors.json');

// Patrones de corrección específicos para cada archivo
const CORRECTION_PATTERNS = [
  // AppTest.jsx
  {
    filePattern: /AppTest\.jsx$/,
    importPatterns: [
      { from: /\.\/components\/SimpleTest\.jsx/, to: './components/domain/admin/SimpleTest.jsx' }
    ]
  },
  // DomainManager.jsx
  {
    filePattern: /components[\\\/]base[\\\/]DomainManager\.jsx$/,
    importPatterns: [
      { from: /\.\.\/.\.\/hooks\/useCrudManager\.js/, to: '../../../hooks/useCrudManager.js' }
    ]
  },
  // DataManager.jsx
  {
    filePattern: /components[\\\/]common[\\\/]DataManager\.jsx$/,
    importPatterns: [
      { from: /\.\.\/.\.\/hooks\/useCrudManager\.js/, to: '../../../hooks/useCrudManager.js' }
    ]
  },
  // DataList.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]admin[\\\/]DataList\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(config\/constants\.js)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/logger\.js)/, to: '../../../$1' },
      { from: /\.\.\/(services\/api\.service\.js)/, to: '../../../$1' }
    ]
  },
  // AuthContextProvider.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]auth[\\\/]AuthContextProvider\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useAuth\.js)/, to: '../../../$1' }
    ]
  },
  // LoginForm.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]auth[\\\/]LoginForm\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(services\/auth\.service)/, to: '../../../$1' }
    ]
  },
  // RoleManager.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]auth[\\\/]RoleManager\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(config\/api)/, to: '../../../$1' }
    ]
  },
  // GaleriaManager.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]galeria[\\\/]GaleriaManager\.jsx$/,
    importPatterns: [
      { from: /\.\/domain\/public\/GaleriaForm\.jsx/, to: '../public/GaleriaForm.jsx' },
      { from: /\.\/domain\/public\/GaleriaGrid\.jsx/, to: '../public/GaleriaGrid.jsx' }
    ]
  },
  // ImageViewer.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]ImageViewer\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useMaterials\.js)/, to: '../../../$1' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/logger\.js)/, to: '../../../$1' },
      { from: /\.\/darkmode\.css/, to: './darkmode.css' },
      { from: /\.\/ImageViewer\.styles\.css/, to: './ImageViewer.styles.css' }
    ]
  },
  // ListaMateriales.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]ListaMateriales\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useMaterials)(?!\.js)/, to: '../../../$1.js' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/helpers)(?!\.js)/, to: '../../../$1.js' },
      { from: /\.\/SubirMultiplesMateriales(?!\.jsx)/, to: './SubirMultiplesMateriales.jsx' },
      { from: /\.\/ImageViewer(?!\.jsx)/, to: './ImageViewer.jsx' },
      { from: /\.\/domain\/materials\/ListaMateriales\.css/, to: './ListaMateriales.css' }
    ]
  },
  // MaterialFilters.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]MaterialFilters\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useMaterials\.js)/, to: '../../../$1' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/logger\.js)/, to: '../../../$1' },
      { from: /\.\/darkmode\.css/, to: './darkmode.css' },
      { from: /\.\/domain\/materials\/MaterialFilters\.styles\.css/, to: './MaterialFilters.styles.css' }
    ]
  },
  // RepositorioProfesor.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]RepositorioProfesor\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useMaterials)(?!\.js)/, to: '../../../$1.js' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/helpers)(?!\.js)/, to: '../../../$1.js' },
      { from: /\.\/ImageViewer(?!\.jsx)/, to: './ImageViewer.jsx' },
      { from: /\.\/SubirArchivos(?!\.jsx)/, to: './SubirArchivos.jsx' }
    ]
  },
  // SubirArchivos.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]SubirArchivos\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(config\/api\.js)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/logger\.js)/, to: '../../../$1' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' }
    ]
  },
  // SubirMaterial.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]materials[\\\/]SubirMaterial\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(hooks\/useMaterials\.js)/, to: '../../../$1' },
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(utils\/logger\.js)/, to: '../../../$1' },
      { from: /\.\/darkmode\.css/, to: './darkmode.css' },
      { from: /\.\/domain\/materials\/SubirMaterial\.styles\.css/, to: './SubirMaterial.styles.css' }
    ]
  },
  // EmailConfig.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]messaging[\\\/]EmailConfig\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(services\/messagingService)(?!\.js)/, to: '../../../$1.js' }
    ]
  },
  // WhatsAppConfig.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]messaging[\\\/]WhatsAppConfig\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(context\/AuthContext\.jsx)/, to: '../../../$1' },
      { from: /\.\.\/(services\/messagingService\.js)/, to: '../../../$1' }
    ]
  },
  // CardsProfesoresManager.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]profesores[\\\/]CardsProfesoresManager\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(config\/api)(?!\.js)/, to: '../../../$1.js' }
    ]
  },
  // Hero.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]public[\\\/]Hero\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(assets\/hero\.jpg)/, to: '../../../$1' },
      { from: /\.\/domain\/public\/Card\.jsx/, to: './Card.jsx' }
    ]
  },
  // Profesores.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]public[\\\/]Profesores\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(assets\/maria\.png)/, to: '../../../$1' }
    ]
  },
  // HorarioAdmin.jsx
  {
    filePattern: /components[\\\/]domain[\\\/]schedule[\\\/]HorarioAdmin\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(services\/messagingService)(?!\.js)/, to: '../../../$1.js' }
    ]
  },
  // Root.jsx
  {
    filePattern: /routes[\\\/]Root\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(services\/auth\.service)(?!\.js)/, to: '../$1.js' }
    ]
  },
  // alumnos.service.js
  {
    filePattern: /services[\\\/]alumnos\.service\.js$/,
    importPatterns: [
      { from: /\.\/root\.service(?!\.js)/, to: './root.service.js' }
    ]
  },
  // ImageViewer.test.jsx
  {
    filePattern: /test[\\\/]ImageViewer\.test\.jsx$/,
    importPatterns: [
      { from: /\.\.\/(components\/ImageViewer)(?!\.jsx)/, to: '../components/domain/materials/ImageViewer.jsx' }
    ]
  }
];

// Función para corregir las importaciones en un archivo
function fixImportsInFile(filePath, patterns) {
  try {
    // Leer el contenido del archivo
    const fullPath = path.join(SRC_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`Archivo no encontrado: ${fullPath}`);
      return false;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Encontrar el patrón de corrección adecuado para este archivo
    for (const pattern of patterns) {
      if (pattern.filePattern.test(filePath)) {
        console.log(`Aplicando patrones para: ${filePath}`);
        // Aplicar los patrones de importación
        for (const importPattern of pattern.importPatterns) {
          // Crear una expresión regular que coincida con la importación completa
          const importRegex = new RegExp(`import\\s+(?:(.+)\\s+from\\s+)?['"]${importPattern.from.source}['"](?:;?)`, 'g');
          
          // Buscar coincidencias antes de reemplazar
          const matches = content.match(importRegex);
          if (matches) {
            // Reemplazar la importación
            const originalContent = content;
            content = content.replace(importRegex, (match, importName, importPath) => {
              const importPathValue = match.match(/['"]([^'"]+)['"]/);
              if (importPathValue && importPathValue[1]) {
                console.log(`  - Encontrada importación: ${importPathValue[1]}`);
                // Determinar el reemplazo
                let replacement = importPattern.to;
                if (replacement.includes('$1')) {
                  // Extraer la parte capturada por el grupo
                  const captured = importPattern.from.exec(importPathValue[1]);
                  if (captured && captured[1]) {
                    replacement = replacement.replace('$1', captured[1]);
                  }
                }
                console.log(`  - Reemplazando por: ${replacement}`);
                
                if (importName) {
                  return `import ${importName} from '${replacement}';`;
                } else {
                  return `import '${replacement}';`;
                }
              }
              return match; // Si no se puede extraer la ruta, devolver la coincidencia original
            });
            
            if (content !== originalContent) {
              modified = true;
            }
          }
        }
      }
    }
    
    // Guardar el archivo si se modificó
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ No se encontraron patrones para corregir: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
async function main() {
  try {
    // Verificar que el archivo de errores existe
    if (!fs.existsSync(ERRORS_FILE)) {
      console.error(`El archivo de errores no existe: ${ERRORS_FILE}`);
      return;
    }
    
    // Leer el archivo de errores
    const errorsData = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf8'));
    const { errors } = errorsData;
    
    if (!errors || !Array.isArray(errors) || errors.length === 0) {
      console.log('No se encontraron errores para corregir.');
      return;
    }
    
    console.log(`Encontrados ${errors.length} errores para corregir.`);
    
    // Agrupar errores por archivo para evitar múltiples escrituras
    const fileErrors = {};
    for (const error of errors) {
      if (!fileErrors[error.file]) {
        fileErrors[error.file] = [];
      }
      fileErrors[error.file].push(error);
    }
    
    // Corregir cada archivo
    let fixedCount = 0;
    let failedCount = 0;
    
    for (const filePath of Object.keys(fileErrors)) {
      const result = fixImportsInFile(filePath, CORRECTION_PATTERNS);
      if (result) {
        fixedCount++;
      } else {
        failedCount++;
      }
    }
    
    console.log('\n--- Resumen ---');
    console.log(`Total de archivos procesados: ${Object.keys(fileErrors).length}`);
    console.log(`Archivos corregidos: ${fixedCount}`);
    console.log(`Archivos no corregidos: ${failedCount}`);
    
    if (failedCount > 0) {
      console.log('\nAlgunos archivos no pudieron ser corregidos automáticamente.');
      console.log('Revisa manualmente estos archivos o ejecuta nuevamente el script de detección para ver los errores restantes.');
    }
  } catch (error) {
    console.error('Error al ejecutar el script:', error.message);
  }
}

// Ejecutar el script
main();