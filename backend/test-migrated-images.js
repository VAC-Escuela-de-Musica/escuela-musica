import fetch from 'node-fetch';

// URLs migradas para verificar
const migratedUrls = [
  'http://146.83.198.35:1254/imagenes-publicas/galeria/galeria/0223b8f4-bf4e-4a7b-bdf6-3f75c56a0a0c.png',
  'http://146.83.198.35:1254/imagenes-publicas/galeria/galeria/867cf1ae-c778-4c35-b6e8-97b39dc637d2.png',
  'http://146.83.198.35:1254/imagenes-publicas/galeria/galeria_1753355868781_FB_IMG_1731965558822 - copia (2).jpg',
  'http://146.83.198.35:1254/imagenes-publicas/galeria/galeria_1753356052536_FB_IMG_1731965558822 - copia - copia.jpg'
];

// URLs originales problemáticas para comparar
const originalProblematicUrls = [
  'http://146.83.198.35:1254/galeria-imagenes/galeria_1753519240437_vheqidhtw',
  'http://146.83.198.35:1254/galeria-imagenes/galeria_1753518646012_bwcyrnkfy'
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
  console.log('🔍 Verificando imágenes migradas...\n');
  
  // Probar URLs migradas
  console.log('✅ URLs MIGRADAS (deberían funcionar):');
  let successCount = 0;
  for (const url of migratedUrls) {
    const result = await testImageUrl(url, 'URL migrada');
    if (result.accessible) successCount++;
    console.log('');
  }
  
  // Probar URLs originales problemáticas
  console.log('❌ URLs ORIGINALES PROBLEMÁTICAS (deberían fallar):');
  for (const url of originalProblematicUrls) {
    await testImageUrl(url, 'URL original problemática');
    console.log('');
  }
  
  console.log(`📊 Resumen:`);
  console.log(`   - URLs migradas probadas: ${migratedUrls.length}`);
  console.log(`   - URLs migradas accesibles: ${successCount}`);
  console.log(`   - Tasa de éxito: ${(successCount / migratedUrls.length * 100).toFixed(1)}%`);
  
  if (successCount === migratedUrls.length) {
    console.log('🎉 ¡Todas las imágenes migradas son accesibles!');
  } else {
    console.log('⚠️ Algunas imágenes migradas aún no son accesibles');
  }
}

// Ejecutar las pruebas
testAllUrls().catch(console.error); 