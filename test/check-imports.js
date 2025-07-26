import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname equivalente en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const SRC_DIR = path.join(__dirname, 'frontend', 'src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Función para verificar si un archivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Función para encontrar todos los archivos con las extensiones especificadas
function findFiles(dir, extensions) {
  let results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      results = results.concat(findFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(item.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Función para extraer importaciones de un archivo
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:.+\s+from\s+)?['"]([^'"]+)['"];?/g;
  const cssImportRegex = /import\s+['"]([^'"]+\.css)['"];?/g;
  
  const imports = [];
  let match;
  
  // Extraer importaciones normales
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Extraer importaciones de CSS
  while ((match = cssImportRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Función para verificar si una importación es válida
function checkImport(importPath, filePath) {
  // Ignorar importaciones de paquetes npm
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    return { valid: true, importPath };
  }
  
  const fileDir = path.dirname(filePath);
  let fullImportPath = path.resolve(fileDir, importPath);
  
  // Si la importación no tiene extensión, probar con las extensiones soportadas
  if (!path.extname(fullImportPath)) {
    for (const ext of EXTENSIONS) {
      if (fileExists(fullImportPath + ext)) {
        return { valid: true, importPath };
      }
    }
    
    // Verificar si es un directorio con un archivo index
    for (const ext of EXTENSIONS) {
      if (fileExists(path.join(fullImportPath, 'index' + ext))) {
        return { valid: true, importPath };
      }
    }
  } else {
    // Si ya tiene extensión, verificar directamente
    if (fileExists(fullImportPath)) {
      return { valid: true, importPath };
    }
  }
  
  // Verificar archivos de recursos (imágenes, etc.)
  if (['.png', '.jpg', '.jpeg', '.svg', '.gif'].includes(path.extname(importPath).toLowerCase())) {
    const assetPath = path.resolve(fileDir, importPath);
    if (fileExists(assetPath)) {
      return { valid: true, importPath };
    }
    
    // Verificar si existe con otra extensión (por ejemplo, .png en lugar de .jpg)
    const baseName = path.basename(importPath, path.extname(importPath));
    const dirName = path.dirname(assetPath);
    
    if (fs.existsSync(dirName)) {
      const files = fs.readdirSync(dirName);
      const similarFiles = files.filter(file => 
        file.startsWith(baseName + '.') && 
        ['.png', '.jpg', '.jpeg', '.svg', '.gif'].includes(path.extname(file).toLowerCase())
      );
      
      if (similarFiles.length > 0) {
        return { 
          valid: false, 
          importPath, 
          suggestion: path.relative(fileDir, path.join(dirName, similarFiles[0])).replace(/\\/g, '/') 
        };
      }
    }
  }
  
  return { valid: false, importPath };
}

// Función principal
function checkAllImports() {
  console.log('Revisando importaciones en:', SRC_DIR);
  const files = findFiles(SRC_DIR, EXTENSIONS);
  console.log(`Encontrados ${files.length} archivos para revisar.`);
  
  let errorCount = 0;
  const errors = [];
  
  for (const file of files) {
    const relativeFilePath = path.relative(SRC_DIR, file);
    const imports = extractImports(file);
    
    for (const importPath of imports) {
      const result = checkImport(importPath, file);
      
      if (!result.valid) {
        errorCount++;
        const error = {
          file: relativeFilePath,
          importPath: result.importPath,
          suggestion: result.suggestion || null
        };
        errors.push(error);
        
        let errorMsg = `ERROR en ${relativeFilePath}: No se puede resolver '${result.importPath}'`;
        if (result.suggestion) {
          errorMsg += ` - Sugerencia: '${result.suggestion}'`;
        }
        console.log(errorMsg);
      }
    }
  }
  
  console.log('\n--- Resumen ---');
  console.log(`Total de errores encontrados: ${errorCount}`);
  
  if (errorCount > 0) {
    fs.writeFileSync(
      'import-errors.json', 
      JSON.stringify({ errors }, null, 2), 
      'utf8'
    );
    console.log('Los detalles de los errores se han guardado en import-errors.json');
  }
}

// Ejecutar el script
checkAllImports();