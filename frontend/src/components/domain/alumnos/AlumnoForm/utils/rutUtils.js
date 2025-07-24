// Utilidad para formatear RUT chileno en tiempo real
// Ejemplo: 12345678K => 12.345.678-K

export function formatearRut(valor) {
  if (!valor) return '';
  // Eliminar todo lo que no sea número o K/k
  let limpio = valor.replace(/[^0-9kK]/g, '').toUpperCase();
  // Separar cuerpo y dígito verificador
  let cuerpo = limpio.slice(0, -1);
  let dv = limpio.slice(-1);
  // Formatear con puntos
  let cuerpoFormateado = '';
  for (let i = cuerpo.length; i > 0; i -= 3) {
    let start = Math.max(i - 3, 0);
    let chunk = cuerpo.substring(start, i);
    cuerpoFormateado = (start > 0 ? '.' : '') + chunk + cuerpoFormateado;
  }
  // Unir cuerpo y dígito verificador
  if (cuerpoFormateado) {
    return `${cuerpoFormateado}-${dv}`;
  } else {
    return dv;
  }
}
