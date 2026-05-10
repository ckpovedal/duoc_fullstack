export function obtenerImagenMascota(imagen: unknown): string {
  if (!imagen) {
    return '';
  }

  if (typeof imagen === 'string') {
    if (imagen.startsWith('data:image/')) {
      return imagen;
    }

    if (imagen.startsWith('\\x')) {
      return crearDataUrlDesdeHexadecimal(imagen.slice(2));
    }

    return '';
  }

  if (Array.isArray(imagen)) {
    return crearDataUrlDesdeBytes(imagen);
  }

  if (typeof imagen === 'object' && imagen !== null && 'data' in imagen) {
    const data = (imagen as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return crearDataUrlDesdeBytes(data);
    }
  }

  return '';
}

export function obtenerTextoReporte(valor: unknown, respaldo: string): string {
  if (valor === undefined || valor === null) {
    return respaldo;
  }

  const texto = String(valor).trim();
  return texto ? texto : respaldo;
}

export function obtenerTipoMascota(tipo: unknown): string {
  const tipos: Record<string, string> = {
    '1': 'Perro',
    '2': 'Gato',
    '3': 'Otro'
  };

  return tipos[String(tipo)] || 'Sin registrar';
}

export function obtenerGeneroMascota(genero: unknown): string {
  const generos: Record<string, string> = {
    '1': 'Macho',
    '2': 'Hembra',
    '3': 'No especifica'
  };

  return generos[String(genero)] || 'Sin registrar';
}

export function obtenerRespuestaReporte(valor: unknown): string {
  const respuestas: Record<string, string> = {
    '1': 'Sí',
    '2': 'No',
    '3': 'No se sabe'
  };

  return respuestas[String(valor)] || 'Sin registrar';
}

export function obtenerEdadMascota(edadMeses: unknown): string {
  const edad = obtenerNumero(edadMeses);

  if (edad === null) {
    return 'Sin registrar';
  }

  if (edad < 12) {
    return edad === 1 ? '1 mes' : `${edad} meses`;
  }

  const anios = Math.floor(edad / 12);
  const meses = edad % 12;

  if (meses === 0) {
    return anios === 1 ? '1 año' : `${anios} años`;
  }

  const textoAnios = anios === 1 ? '1 año' : `${anios} años`;
  const textoMeses = meses === 1 ? '1 mes' : `${meses} meses`;
  return `${textoAnios} y ${textoMeses}`;
}

export function formatearFechaReporte(fecha: unknown): string {
  if (!fecha) {
    return 'Sin registrar';
  }

  const fechaObjeto = new Date(String(fecha));

  if (Number.isNaN(fechaObjeto.getTime())) {
    return String(fecha);
  }

  return fechaObjeto.toLocaleDateString('es-CL');
}

export function obtenerEstadoPerdida(estado: unknown): string {
  const estados: Record<string, string> = {
    '1': 'Activo',
    '2': 'Resuelto',
    '3': 'Inactivo'
  };

  return estados[String(estado)] || 'Sin estado';
}

export function obtenerEstadoHallazgo(estado: unknown): string {
  const estados: Record<string, string> = {
    '1': 'Activo',
    '2': 'Reunificado',
    '3': 'Inactivo'
  };

  return estados[String(estado)] || 'Sin estado';
}

export function obtenerClaseEstado(estado: unknown): string {
  const clases: Record<string, string> = {
    '1': 'estado-activo',
    '2': 'estado-resuelto',
    '3': 'estado-inactivo'
  };

  return clases[String(estado)] || 'estado-sin-estado';
}

export function acortarTexto(texto: string, largoMaximo: number): string {
  if (texto.length <= largoMaximo) {
    return texto;
  }

  return `${texto.slice(0, largoMaximo).trim()}...`;
}

function crearDataUrlDesdeHexadecimal(hexadecimal: string): string {
  const bytes: number[] = [];

  for (let i = 0; i < hexadecimal.length; i += 2) {
    bytes.push(parseInt(hexadecimal.substring(i, i + 2), 16));
  }

  return crearDataUrlDesdeBytes(bytes);
}

function crearDataUrlDesdeBytes(bytes: number[]): string {
  const tipo = obtenerTipoImagen(bytes);
  let binario = '';

  for (let i = 0; i < bytes.length; i += 1) {
    binario += String.fromCharCode(bytes[i]);
  }

  return `data:${tipo};base64,${btoa(binario)}`;
}

function obtenerTipoImagen(bytes: number[]): string {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return 'image/gif';
  }

  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function obtenerNumero(valor: unknown): number | null {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}
