import fetch from 'node-fetch'

try {
  console.log('🔍 Testing API endpoints...')

  // Test 1: Cards profesores
  const response1 = await fetch('http://localhost:1230/api/cards-profesores')
  console.log(`📋 GET /api/cards-profesores: ${response1.status} ${response1.statusText}`)
  if (response1.ok) {
    const data1 = await response1.json()
    console.log('   Data:', data1)
  }

  // Test 2: Cards profesores /active
  const response2 = await fetch('http://localhost:1230/api/cards-profesores/active')
  console.log(`📋 GET /api/cards-profesores/active: ${response2.status} ${response2.statusText}`)
  if (response2.ok) {
    const data2 = await response2.json()
    console.log('   Data:', data2)
  }
} catch (error) {
  console.error('❌ Error testing API:', error.message)
}
