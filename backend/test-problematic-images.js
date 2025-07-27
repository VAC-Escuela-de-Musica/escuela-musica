import fetch from 'node-fetch';

// URLs problemáticas identificadas
const problematicUrls = [
  'http://146.83.198.35:1254/galeria-imagenes/galeria_1753519240437_vheqidhtw',
  'http://146.83.198.35:1254/galeria-imagenes/galeria_1753518646012_bwcyrnkfy'
];

// URLs de comparación (que sí funcionan)
const workingUrls = [
  'http://146.83.198.35:1254/imagenes-publicas/galeria/52061e64-845d-41c3-95d5-c394094d0d1e.jpeg',
  'http://146.83.198.35:1254/imagenes-publicas/galeria/3cd1a263-c295-4d64-a9a1-b2c1cbdff956.jpeg'
];

async function testImageUrl(url, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, { 
      method: 'HEAD', 
      timeout: 10000 
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'server': response.headers.get('server')
    });
    
    return {
      url,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      url,
      accessible: false,
      error: error.message
    };
  }
}

async function testAllUrls() {
  console.log('🔍 Iniciando pruebas de URLs problemáticas...\n');
  
  // Probar URLs problemáticas
  console.log('❌ URLs PROBLEMÁTICAS:');
  for (const url of problematicUrls) {
    await testImageUrl(url, 'URL problemática');
    console.log('');
  }
  
  // Probar URLs que funcionan
  console.log('✅ URLs QUE FUNCIONAN:');
  for (const url of workingUrls) {
    await testImageUrl(url, 'URL que funciona');
    console.log('');
  }
  
  // Probar diferentes variaciones
  console.log('🔧 PRUEBAS ADICIONALES:');
  
  // Probar sin parámetros de query
  for (const url of problematicUrls) {
    const cleanUrl = url.split('?')[0];
    await testImageUrl(cleanUrl, 'URL sin parámetros de query');
    console.log('');
  }
  
  // Probar con diferentes puertos
  const ports = [1230, 1254, 9000];
  for (const port of ports) {
    const testUrl = `http://146.83.198.35:${port}/galeria-imagenes/galeria_1753519240437_vheqidhtw`;
    await testImageUrl(testUrl, `URL con puerto ${port}`);
    console.log('');
  }
  
  // Probar buckets diferentes
  const buckets = ['galeria-imagenes', 'imagenes-publicas', 'galeria'];
  for (const bucket of buckets) {
    const testUrl = `http://146.83.198.35:1254/${bucket}/galeria_1753519240437_vheqidhtw`;
    await testImageUrl(testUrl, `URL con bucket ${bucket}`);
    console.log('');
  }
}

// Ejecutar las pruebas
testAllUrls().catch(console.error); 