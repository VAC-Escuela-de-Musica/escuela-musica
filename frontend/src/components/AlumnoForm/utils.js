// Formatea un string a formato HH:MM en tiempo real
export function formatearHora(valor) {
  if (!valor) return "";
  // Eliminar todo lo que no sea dígito
  let limpio = valor.replace(/[^0-9]/g, "");
  if (limpio.length <= 2) return limpio;
  if (limpio.length <= 4) return limpio.slice(0, 2) + ":" + limpio.slice(2, 4);
  return limpio.slice(0, 2) + ":" + limpio.slice(2, 4); // Limitar a HH:MM
}

// Valida si un string es una hora válida en formato HH:MM
export function esHoraValida(hora) {
  if (!hora || !/^\d{2}:\d{2}$/.test(hora)) return false;
  const [hh, mm] = hora.split(":").map(Number);
  return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
}
// Extrae dia y hora desde un string tipo 'Lunes 16:00'
export function extractDiaHoraFromClase(clase) {
  if (typeof clase !== "string") return { dia: "", hora: "" };
  const match = clase.match(/^(\S+)\s+(\d{2}:\d{2})$/);
  if (match) {
    return { dia: match[1], hora: match[2] };
  }
  return { dia: "", hora: "" };
}
// Funciones utilitarias de formateo y helpers
export const formatRut = (value) => {
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (clean.length < 2) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let cuerpoFormateado = "";
  let i = cuerpo.length;
  while (i > 3) {
    cuerpoFormateado = "." + cuerpo.slice(i - 3, i) + cuerpoFormateado;
    i -= 3;
  }
  cuerpoFormateado = cuerpo.slice(0, i) + cuerpoFormateado;
  let rutFinal = `${cuerpoFormateado}-${dv}`;
  return rutFinal.slice(0, 12);
};

export const formatDateToCL = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseDateFromCL = (clDateStr) => {
  if (!clDateStr) return "";
  const [day, month, year] = clDateStr.split("-");
  return `${year}-${month}-${day}`;
};

export const initArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.length > 0 ? val.split(',').map(i => i.trim()) : []);
export const initBool = (val) => typeof val === 'boolean' ? val : !!val;
// Elimina cualquier prefijo internacional (ej: +56, +34, +1, etc.) del teléfono
export const getTelefonoSinPrefijo = (tel, prefijo = "", largoEsperado = 9) => {
  if (!tel) return "";
  if (prefijo && tel.startsWith(prefijo)) {
    const posibleNumero = tel.slice(prefijo.length);
    if (/^\d+$/.test(posibleNumero) && posibleNumero.length === largoEsperado) {
      return posibleNumero;
    }
  }
  // Si no se pasa prefijo, intenta detectar uno internacional
  const match = tel.match(/^\+\d{1,4}/);
  if (match) {
    const posibleNumero = tel.slice(match[0].length);
    if (/^\d+$/.test(posibleNumero) && posibleNumero.length === largoEsperado) {
      return posibleNumero;
    }
  }
  return tel;
};

// Une prefijo y número en un solo string
export const unirTelefono = (prefijo, numero) => {
  if (!prefijo && !numero) return "";
  return `${prefijo}${numero}`;
};
