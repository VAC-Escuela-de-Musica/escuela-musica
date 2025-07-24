/**
 * Script Principal para Ejecutar Todos los Tests de WhatsApp
 * Sistema GPS - Escuela de Música
 * 
 * Este script ejecuta todos los tests de WhatsApp y genera un reporte completo
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.cyan}\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.bold}${colors.magenta}\n--- ${msg} ---${colors.reset}`),
  separator: () => console.log(`${colors.dim}${'-'.repeat(60)}${colors.reset}`)
};

// Configuración de tests
const TEST_CONFIG = {
  timeout: 60000, // 1 minuto por test
  retries: 1,
  outputDir: './test-results',
  reportFile: './test-results/whatsapp-test-report.json'
};

// Lista de tests a ejecutar
const TESTS = [
  {
    name: 'Test Completo de WhatsApp',
    file: './test-whatsapp-complete.js',
    description: 'Test integral de toda la funcionalidad de WhatsApp',
    category: 'integration'
  },
  {
    name: 'Test de WhatsApp Web',
    file: './backend/test-whatsapp-web.js',
    description: 'Test específico del servicio WhatsApp Web',
    category: 'backend',
    cwd: './'
  },
  {
    name: 'Test del Frontend',
    file: './frontend/test-whatsapp-frontend.js',
    description: 'Test del componente y servicios del frontend',
    category: 'frontend',
    cwd: './'
  }
];

// Resultados de los tests
let testResults = {
  startTime: new Date(),
  endTime: null,
  totalTests: TESTS.length,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: [],
  summary: {
    integration: { passed: 0, failed: 0, skipped: 0 },
    backend: { passed: 0, failed: 0, skipped: 0 },
    frontend: { passed: 0, failed: 0, skipped: 0 }
  }
};

/**
 * Crear directorio de resultados
 */
function createOutputDir() {
  if (!fs.existsSync(TEST_CONFIG.outputDir)) {
    fs.mkdirSync(TEST_CONFIG.outputDir, { recursive: true });
    log.info(`Directorio de resultados creado: ${TEST_CONFIG.outputDir}`);
  }
}

/**
 * Verificar si un archivo existe
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Ejecutar un test individual
 */
function runTest(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    log.subtitle(`Ejecutando: ${test.name}`);
    console.log(`📁 Archivo: ${test.file}`);
    console.log(`📝 Descripción: ${test.description}`);
    console.log(`🏷️  Categoría: ${test.category}`);
    
    // Verificar si el archivo existe
    if (!fileExists(test.file)) {
      const result = {
        name: test.name,
        file: test.file,
        category: test.category,
        status: 'skipped',
        duration: 0,
        error: 'Archivo de test no encontrado',
        output: '',
        startTime: new Date(startTime),
        endTime: new Date()
      };
      
      testResults.skipped++;
      testResults.summary[test.category].skipped++;
      testResults.results.push(result);
      
      log.warning(`Test saltado: ${test.name} - Archivo no encontrado`);
      resolve(result);
      return;
    }
    
    // Configurar el proceso
    const options = {
      cwd: test.cwd || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    };
    
    // Ejecutar el test
    const child = spawn('node', [test.file], options);
    
    let output = '';
    let errorOutput = '';
    
    // Capturar output
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text); // Mostrar en tiempo real
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text); // Mostrar errores en tiempo real
    });
    
    // Timeout
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      log.error(`Test ${test.name} excedió el tiempo límite`);
    }, TEST_CONFIG.timeout);
    
    // Cuando termina
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        name: test.name,
        file: test.file,
        category: test.category,
        status: code === 0 ? 'passed' : 'failed',
        exitCode: code,
        duration,
        output: output,
        errorOutput: errorOutput,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      };
      
      if (code === 0) {
        testResults.passed++;
        testResults.summary[test.category].passed++;
        log.success(`Test completado: ${test.name} (${duration}ms)`);
      } else {
        testResults.failed++;
        testResults.summary[test.category].failed++;
        log.error(`Test fallido: ${test.name} (código: ${code}, ${duration}ms)`);
      }
      
      testResults.results.push(result);
      resolve(result);
    });
    
    child.on('error', (error) => {
      clearTimeout(timeout);
      
      const result = {
        name: test.name,
        file: test.file,
        category: test.category,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message,
        output: output,
        errorOutput: errorOutput,
        startTime: new Date(startTime),
        endTime: new Date()
      };
      
      testResults.failed++;
      testResults.summary[test.category].failed++;
      testResults.results.push(result);
      
      log.error(`Error ejecutando test ${test.name}: ${error.message}`);
      resolve(result);
    });
  });
}

/**
 * Generar reporte de resultados
 */
function generateReport() {
  testResults.endTime = new Date();
  const totalDuration = testResults.endTime - testResults.startTime;
  
  // Reporte en consola
  log.title('REPORTE FINAL DE TESTS DE WHATSAPP');
  
  console.log(`⏱️  Tiempo total: ${Math.round(totalDuration / 1000)}s`);
  console.log(`📊 Tests ejecutados: ${testResults.totalTests}`);
  console.log(`${colors.green}✅ Pasados: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Fallidos: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⏭️  Saltados: ${testResults.skipped}${colors.reset}`);
  
  const successRate = testResults.totalTests > 0 
    ? ((testResults.passed / (testResults.totalTests - testResults.skipped)) * 100).toFixed(1)
    : 0;
  
  console.log(`\n${colors.bold}📈 Tasa de éxito: ${successRate}%${colors.reset}`);
  
  // Reporte por categoría
  log.subtitle('Resultados por Categoría');
  Object.entries(testResults.summary).forEach(([category, stats]) => {
    const total = stats.passed + stats.failed + stats.skipped;
    if (total > 0) {
      console.log(`\n🏷️  ${category.toUpperCase()}:`);
      console.log(`   ✅ Pasados: ${stats.passed}`);
      console.log(`   ❌ Fallidos: ${stats.failed}`);
      console.log(`   ⏭️  Saltados: ${stats.skipped}`);
    }
  });
  
  // Detalles de tests fallidos
  const failedTests = testResults.results.filter(r => r.status === 'failed');
  if (failedTests.length > 0) {
    log.subtitle('Tests Fallidos');
    failedTests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   📁 Archivo: ${test.file}`);
      console.log(`   ❌ Error: ${test.error || 'Código de salida: ' + test.exitCode}`);
      if (test.errorOutput) {
        console.log(`   📝 Output de error: ${test.errorOutput.substring(0, 200)}...`);
      }
    });
  }
  
  // Tests saltados
  const skippedTests = testResults.results.filter(r => r.status === 'skipped');
  if (skippedTests.length > 0) {
    log.subtitle('Tests Saltados');
    skippedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name} - ${test.error}`);
    });
  }
  
  // Guardar reporte JSON
  try {
    fs.writeFileSync(TEST_CONFIG.reportFile, JSON.stringify(testResults, null, 2));
    log.info(`Reporte guardado en: ${TEST_CONFIG.reportFile}`);
  } catch (error) {
    log.warning(`No se pudo guardar el reporte: ${error.message}`);
  }
  
  // Recomendaciones
  log.subtitle('Recomendaciones');
  
  if (testResults.failed > 0) {
    console.log('🔧 Para solucionar problemas:');
    console.log('   1. Verifica que el servidor backend esté corriendo');
    console.log('   2. Asegúrate de tener las dependencias instaladas');
    console.log('   3. Revisa la configuración de variables de entorno');
    console.log('   4. Verifica la conectividad de red');
  }
  
  if (testResults.skipped > 0) {
    console.log('📁 Para ejecutar tests saltados:');
    console.log('   1. Verifica que todos los archivos de test existan');
    console.log('   2. Ejecuta los tests individuales para más detalles');
  }
  
  console.log('\n📚 Para más información:');
  console.log('   - Revisa los logs individuales de cada test');
  console.log('   - Consulta la documentación del proyecto');
  console.log('   - Verifica el estado de WhatsApp Web en la interfaz');
}

/**
 * Verificar prerrequisitos
 */
function checkPrerequisites() {
  log.subtitle('Verificando Prerrequisitos');
  
  // Verificar Node.js
  console.log('🟢 Node.js:', process.version);
  
  // Verificar archivos de test
  const missingFiles = TESTS.filter(test => !fileExists(test.file));
  if (missingFiles.length > 0) {
    log.warning(`${missingFiles.length} archivos de test no encontrados:`);
    missingFiles.forEach(test => {
      console.log(`   - ${test.file}`);
    });
  } else {
    log.success('Todos los archivos de test encontrados');
  }
  
  // Verificar directorio de backend
  if (fs.existsSync('./backend')) {
    console.log('✅ Directorio backend encontrado');
  } else {
    log.warning('Directorio backend no encontrado');
  }
  
  // Verificar directorio de frontend
  if (fs.existsSync('./frontend')) {
    console.log('✅ Directorio frontend encontrado');
  } else {
    log.warning('Directorio frontend no encontrado');
  }
  
  return missingFiles.length === 0;
}

/**
 * Función principal
 */
async function runAllWhatsAppTests() {
  log.title('EJECUTOR DE TESTS DE WHATSAPP - SISTEMA GPS');
  
  console.log('Este script ejecutará todos los tests de WhatsApp:');
  TESTS.forEach((test, index) => {
    console.log(`  ${index + 1}. ${test.name} (${test.category})`);
  });
  
  log.separator();
  
  // Crear directorio de resultados
  createOutputDir();
  
  // Verificar prerrequisitos
  const prereqsOk = checkPrerequisites();
  
  if (!prereqsOk) {
    log.warning('Algunos prerrequisitos no se cumplen, pero continuando...');
  }
  
  log.separator();
  
  // Ejecutar tests secuencialmente
  for (let i = 0; i < TESTS.length; i++) {
    const test = TESTS[i];
    
    console.log(`\n${colors.bold}[${i + 1}/${TESTS.length}] ${test.name}${colors.reset}`);
    
    try {
      await runTest(test);
    } catch (error) {
      log.error(`Error inesperado en test ${test.name}: ${error.message}`);
    }
    
    // Pausa entre tests
    if (i < TESTS.length - 1) {
      log.separator();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generar reporte final
  log.separator();
  generateReport();
  
  // Código de salida
  const exitCode = testResults.failed > 0 ? 1 : 0;
  
  if (exitCode === 0) {
    log.success('¡Todos los tests completados exitosamente!');
  } else {
    log.error('Algunos tests fallaron. Revisa el reporte arriba.');
  }
  
  process.exit(exitCode);
}

// Manejo de señales
process.on('SIGINT', () => {
  log.warning('\nEjecución interrumpida por el usuario');
  generateReport();
  process.exit(130);
});

process.on('SIGTERM', () => {
  log.warning('\nEjecución terminada');
  generateReport();
  process.exit(143);
});

// Ejecutar directamente
runAllWhatsAppTests().catch(error => {
  console.error('Error fatal: ' + error.message);
  console.error(error.stack);
  process.exit(1);
});

export default runAllWhatsAppTests;