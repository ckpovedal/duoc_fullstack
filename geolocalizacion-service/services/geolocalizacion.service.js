const geolocalizacionRepository = require('../repository/geolocalizacion.repository');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

const TIPOS_REPORTE_UBICACION = ['PERDIDA', 'HALLAZGO'];
const TIPOS_REPORTE_ZONA = ['PERDIDA', 'HALLAZGO', 'AMBOS'];
const FUENTES = ['NOMINATIM', 'GPS', 'MANUAL'];

class GeolocalizacionService {
  async geocodificar(data = {}) {
    const direccion = this.obtenerTexto(data, 'direccion', 'geo_direccion', 'zon_direccion');
    const comuna = this.obtenerTexto(data, 'comuna', 'geo_comuna', 'zon_comuna');
    const region = this.obtenerTexto(data, 'region', 'geo_region', 'zon_region');
    const pais = this.obtenerTexto(data, 'pais') || process.env.GEOLOCALIZACION_PAIS || 'Chile';

    if (!direccion) {
      throw new AppError('direccion es obligatoria', 400);
    }

    const busqueda = [direccion, comuna, region, pais].filter(Boolean).join(', ');
    const resultados = await this.consultarNominatim('/search', {
      q: busqueda,
      format: 'jsonv2',
      addressdetails: 1,
      limit: this.obtenerLimiteGeocodificacion(data.limite),
      countrycodes: process.env.GEOLOCALIZACION_COUNTRY_CODES || 'cl',
    });

    return {
      busqueda,
      total: resultados.length,
      resultados: resultados.map((item) => this.mapearResultadoNominatim(item)),
    };
  }

  async geocodificarInversa(data = {}) {
    const latitud = this.obtenerNumero(data, 'latitud', 'geo_latitud', 'zon_latitud');
    const longitud = this.obtenerNumero(data, 'longitud', 'geo_longitud', 'zon_longitud');

    this.validarCoordenadas(latitud, longitud);

    const resultado = await this.consultarNominatim('/reverse', {
      lat: latitud,
      lon: longitud,
      format: 'jsonv2',
      addressdetails: 1,
    });

    return this.mapearResultadoNominatim(resultado);
  }

  async consultarNominatim(path, parametros) {
    const baseUrl = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
    const url = new URL(path, baseUrl);

    Object.entries(parametros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url, {
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'sanos-y-salvos-geolocalizacion-service/1.0',
        'Accept-Language': process.env.NOMINATIM_ACCEPT_LANGUAGE || 'es',
      },
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, 'Nominatim no respondio correctamente');
      throw new AppError('No fue posible geocodificar la direccion', 502);
    }

    return response.json();
  }

  mapearResultadoNominatim(item) {
    const direccion = item.address || {};

    return {
      direccionFormateada: item.display_name || null,
      latitud: item.lat !== undefined ? Number(item.lat) : null,
      longitud: item.lon !== undefined ? Number(item.lon) : null,
      comuna: direccion.city || direccion.town || direccion.village || direccion.municipality || direccion.county || null,
      region: direccion.state || direccion.region || null,
      pais: direccion.country || null,
      importancia: item.importance ?? null,
      tipo: item.type || null,
      clase: item.class || null,
      boundingBox: item.boundingbox || null,
    };
  }

  async guardarUbicacion(data, usuarioAutenticadoId) {
    const ubicacion = this.construirUbicacion(data, usuarioAutenticadoId);
    const resultado = await geolocalizacionRepository.guardarUbicacion(ubicacion);
    return this.mapearUbicacion(resultado);
  }

  async listarUbicaciones(filtros = {}) {
    const filtrosNormalizados = this.normalizarFiltrosUbicacion(filtros);
    const resultado = await geolocalizacionRepository.listarUbicaciones(filtrosNormalizados);

    return {
      ...resultado,
      items: resultado.items.map((ubicacion) => this.mapearUbicacion(ubicacion)),
    };
  }

  async obtenerUbicacionPorId(id) {
    const ubicacion = await geolocalizacionRepository.obtenerUbicacionPorId(id);

    if (!ubicacion) {
      throw new AppError('Ubicacion no encontrada', 404);
    }

    return this.mapearUbicacion(ubicacion);
  }

  async obtenerUbicacionPorReporte(tipoReporte, reporteId) {
    const tipoNormalizado = this.normalizarTipoReporte(tipoReporte, TIPOS_REPORTE_UBICACION);
    const ubicacion = await geolocalizacionRepository.obtenerUbicacionPorReporte(tipoNormalizado, reporteId);

    if (!ubicacion) {
      throw new AppError('Ubicacion de reporte no encontrada', 404);
    }

    return this.mapearUbicacion(ubicacion);
  }

  async actualizarUbicacion(id, data, usuarioAutenticadoId) {
    const ubicacionActual = await geolocalizacionRepository.obtenerUbicacionPorId(id);

    if (!ubicacionActual) {
      throw new AppError('Ubicacion no encontrada', 404);
    }

    this.validarPropietario(ubicacionActual.u_id, usuarioAutenticadoId);

    const datosActualizados = this.construirUbicacion({
      ...ubicacionActual,
      ...data,
    }, usuarioAutenticadoId);

    const resultado = await geolocalizacionRepository.actualizarUbicacion(id, datosActualizados);
    return this.mapearUbicacion(resultado);
  }

  async cambiarEstadoUbicacion(id, data, usuarioAutenticadoId) {
    const estado = this.obtenerNumero(data, 'estado', 'geo_estado');

    if (![1, 2, 3].includes(estado)) {
      throw new AppError('estado debe ser 1, 2 o 3', 400);
    }

    const ubicacionActual = await geolocalizacionRepository.obtenerUbicacionPorId(id);

    if (!ubicacionActual) {
      throw new AppError('Ubicacion no encontrada', 404);
    }

    this.validarPropietario(ubicacionActual.u_id, usuarioAutenticadoId);

    const resultado = await geolocalizacionRepository.cambiarEstadoUbicacion(id, estado);
    return this.mapearUbicacion(resultado);
  }

  async crearZonaInteres(data, usuarioAutenticadoId) {
    const zona = this.construirZonaInteres(data, usuarioAutenticadoId);
    const resultado = await geolocalizacionRepository.crearZonaInteres(zona);
    return this.mapearZonaInteres(resultado);
  }

  async listarZonasInteres(filtros = {}) {
    const filtrosNormalizados = this.normalizarFiltrosZona(filtros);
    const resultado = await geolocalizacionRepository.listarZonasInteres(filtrosNormalizados);

    return {
      ...resultado,
      items: resultado.items.map((zona) => this.mapearZonaInteres(zona)),
    };
  }

  async obtenerZonaInteresPorId(id) {
    const zona = await geolocalizacionRepository.obtenerZonaInteresPorId(id);

    if (!zona) {
      throw new AppError('Zona de interes no encontrada', 404);
    }

    return this.mapearZonaInteres(zona);
  }

  async actualizarZonaInteres(id, data, usuarioAutenticadoId) {
    const zonaActual = await geolocalizacionRepository.obtenerZonaInteresPorId(id);

    if (!zonaActual) {
      throw new AppError('Zona de interes no encontrada', 404);
    }

    this.validarPropietario(zonaActual.u_id, usuarioAutenticadoId);

    const datosActualizados = this.construirZonaInteres({
      ...zonaActual,
      ...data,
    }, usuarioAutenticadoId);

    const resultado = await geolocalizacionRepository.actualizarZonaInteres(id, datosActualizados);
    return this.mapearZonaInteres(resultado);
  }

  async cambiarEstadoZonaInteres(id, data, usuarioAutenticadoId) {
    const activa = this.obtenerNumero(data, 'activa', 'estado', 'zon_activa');

    if (![1, 2].includes(activa)) {
      throw new AppError('activa debe ser 1 o 2', 400);
    }

    const zonaActual = await geolocalizacionRepository.obtenerZonaInteresPorId(id);

    if (!zonaActual) {
      throw new AppError('Zona de interes no encontrada', 404);
    }

    this.validarPropietario(zonaActual.u_id, usuarioAutenticadoId);

    const resultado = await geolocalizacionRepository.cambiarEstadoZonaInteres(id, activa);
    return this.mapearZonaInteres(resultado);
  }

  construirUbicacion(data, usuarioAutenticadoId) {
    const usuarioId = usuarioAutenticadoId || this.obtenerTexto(data, 'u_id', 'usuario_id', 'usuarioId');
    const tipoReporte = this.normalizarTipoReporte(
      this.obtenerTexto(data, 'tipo_reporte', 'tipoReporte'),
      TIPOS_REPORTE_UBICACION
    );
    const reporteId = this.obtenerTexto(data, 'reporte_id', 'reporteId');
    const direccion = this.obtenerTexto(data, 'geo_direccion', 'direccion');
    const latitud = this.obtenerNumero(data, 'geo_latitud', 'latitud');
    const longitud = this.obtenerNumero(data, 'geo_longitud', 'longitud');
    const fuente = this.normalizarFuente(this.obtenerTexto(data, 'geo_fuente', 'fuente') || 'MANUAL');
    const estadoValor = this.obtenerNumero(data, 'geo_estado', 'estado');
    const estado = estadoValor === null ? 1 : estadoValor;

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (!reporteId) {
      throw new AppError('reporte_id es obligatorio', 400);
    }

    if (!direccion) {
      throw new AppError('geo_direccion es obligatoria', 400);
    }

    if (![1, 2, 3].includes(estado)) {
      throw new AppError('geo_estado debe ser 1, 2 o 3', 400);
    }

    this.validarCoordenadas(latitud, longitud);

    return {
      tipo_reporte: tipoReporte,
      reporte_id: reporteId,
      u_id: usuarioId,
      geo_direccion: direccion,
      geo_comuna: this.obtenerTexto(data, 'geo_comuna', 'comuna'),
      geo_region: this.obtenerTexto(data, 'geo_region', 'region'),
      geo_latitud: latitud,
      geo_longitud: longitud,
      geo_fuente: fuente,
      geo_fecha: this.obtenerTexto(data, 'geo_fecha', 'fecha'),
      geo_estado: estado,
    };
  }

  construirZonaInteres(data, usuarioAutenticadoId) {
    const usuarioId = usuarioAutenticadoId || this.obtenerTexto(data, 'u_id', 'usuario_id', 'usuarioId');
    const latitud = this.obtenerNumero(data, 'zon_latitud', 'latitud');
    const longitud = this.obtenerNumero(data, 'zon_longitud', 'longitud');
    const radioKm = this.obtenerNumero(data, 'zon_radio_km', 'radioKm', 'radio_km', 'radio');
    const tipoReporte = this.normalizarTipoReporte(
      this.obtenerTexto(data, 'zon_tipo_reporte', 'tipo_reporte', 'tipoReporte') || 'AMBOS',
      TIPOS_REPORTE_ZONA
    );
    const activaValor = this.obtenerNumero(data, 'zon_activa', 'activa');
    const activa = activaValor === null ? 1 : activaValor;

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    this.validarCoordenadas(latitud, longitud);

    if (!radioKm || radioKm <= 0) {
      throw new AppError('zon_radio_km debe ser mayor a 0', 400);
    }

    if (![1, 2].includes(activa)) {
      throw new AppError('zon_activa debe ser 1 o 2', 400);
    }

    return {
      u_id: usuarioId,
      zon_nombre: this.obtenerTexto(data, 'zon_nombre', 'nombre'),
      zon_direccion: this.obtenerTexto(data, 'zon_direccion', 'direccion'),
      zon_comuna: this.obtenerTexto(data, 'zon_comuna', 'comuna'),
      zon_region: this.obtenerTexto(data, 'zon_region', 'region'),
      zon_latitud: latitud,
      zon_longitud: longitud,
      zon_radio_km: radioKm,
      zon_tipo_reporte: tipoReporte,
      zon_activa: activa,
      zon_fecha: this.obtenerTexto(data, 'zon_fecha', 'fecha'),
    };
  }

  normalizarFiltrosUbicacion(filtros) {
    const tipoReporte = this.obtenerTexto(filtros, 'tipo_reporte', 'tipoReporte');
    const normalizados = { ...filtros };

    if (tipoReporte) {
      normalizados.tipo_reporte = this.normalizarTipoReporte(tipoReporte, TIPOS_REPORTE_UBICACION);
    }

    this.normalizarFiltroCoordenadas(normalizados);
    return normalizados;
  }

  normalizarFiltrosZona(filtros) {
    const tipoReporte = this.obtenerTexto(filtros, 'zon_tipo_reporte', 'tipo_reporte', 'tipoReporte');
    const normalizados = { ...filtros };

    if (tipoReporte) {
      normalizados.zon_tipo_reporte = this.normalizarTipoReporte(tipoReporte, TIPOS_REPORTE_ZONA);
    }

    this.normalizarFiltroCoordenadas(normalizados);
    return normalizados;
  }

  normalizarFiltroCoordenadas(filtros) {
    const latitud = this.obtenerNumero(filtros, 'geo_latitud', 'zon_latitud', 'latitud');
    const longitud = this.obtenerNumero(filtros, 'geo_longitud', 'zon_longitud', 'longitud');
    const radioKm = this.obtenerNumero(filtros, 'radio_km', 'radioKm', 'radio');

    if (latitud !== null || longitud !== null || radioKm !== null) {
      this.validarCoordenadas(latitud, longitud);

      if (!radioKm || radioKm <= 0) {
        throw new AppError('radioKm debe ser mayor a 0', 400);
      }

      filtros.latitud = latitud;
      filtros.longitud = longitud;
      filtros.radioKm = radioKm;
    }
  }

  normalizarTipoReporte(valor, permitidos) {
    const normalizado = String(valor || '').trim().toUpperCase();
    const alias = {
      PERDIDO: 'PERDIDA',
      PERDIDOS: 'PERDIDA',
      PERDIDAS: 'PERDIDA',
      HALLADO: 'HALLAZGO',
      HALLADOS: 'HALLAZGO',
      HALLAZGOS: 'HALLAZGO',
    };
    const tipo = alias[normalizado] || normalizado;

    if (!permitidos.includes(tipo)) {
      throw new AppError(`tipo_reporte debe ser ${permitidos.join(', ')}`, 400);
    }

    return tipo;
  }

  normalizarFuente(valor) {
    const fuente = String(valor || '').trim().toUpperCase();

    if (!FUENTES.includes(fuente)) {
      throw new AppError(`geo_fuente debe ser ${FUENTES.join(', ')}`, 400);
    }

    return fuente;
  }

  validarCoordenadas(latitud, longitud) {
    if (latitud === null || longitud === null || Number.isNaN(latitud) || Number.isNaN(longitud)) {
      throw new AppError('latitud y longitud son obligatorias', 400);
    }

    if (latitud < -90 || latitud > 90) {
      throw new AppError('latitud debe estar entre -90 y 90', 400);
    }

    if (longitud < -180 || longitud > 180) {
      throw new AppError('longitud debe estar entre -180 y 180', 400);
    }
  }

  validarPropietario(usuarioIdRegistro, usuarioAutenticadoId) {
    if (!usuarioAutenticadoId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (String(usuarioIdRegistro) !== String(usuarioAutenticadoId)) {
      throw new AppError('No puedes modificar una ubicacion de otro usuario', 403);
    }
  }

  obtenerTexto(data, ...nombres) {
    for (const nombre of nombres) {
      const valor = data?.[nombre];

      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        return String(Array.isArray(valor) ? valor[0] : valor).trim();
      }
    }

    return null;
  }

  obtenerNumero(data, ...nombres) {
    const valor = this.obtenerTexto(data, ...nombres);

    if (valor === null) {
      return null;
    }

    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : NaN;
  }

  obtenerLimiteGeocodificacion(valor) {
    const limite = Number(valor) || 5;
    return Math.min(Math.max(limite, 1), 10);
  }

  mapearUbicacion(ubicacion) {
    return {
      ...ubicacion,
      tipoReporte: ubicacion.tipo_reporte,
      reporteId: ubicacion.reporte_id,
      usuarioId: ubicacion.u_id,
      direccion: ubicacion.geo_direccion,
      comuna: ubicacion.geo_comuna,
      region: ubicacion.geo_region,
      latitud: ubicacion.geo_latitud !== null ? Number(ubicacion.geo_latitud) : null,
      longitud: ubicacion.geo_longitud !== null ? Number(ubicacion.geo_longitud) : null,
      distanciaKm: ubicacion.distancia_km !== null && ubicacion.distancia_km !== undefined
        ? Number(ubicacion.distancia_km)
        : null,
    };
  }

  mapearZonaInteres(zona) {
    return {
      ...zona,
      usuarioId: zona.u_id,
      nombre: zona.zon_nombre,
      direccion: zona.zon_direccion,
      comuna: zona.zon_comuna,
      region: zona.zon_region,
      latitud: zona.zon_latitud !== null ? Number(zona.zon_latitud) : null,
      longitud: zona.zon_longitud !== null ? Number(zona.zon_longitud) : null,
      radioKm: zona.zon_radio_km !== null ? Number(zona.zon_radio_km) : null,
      tipoReporte: zona.zon_tipo_reporte,
      activa: zona.zon_activa,
      distanciaKm: zona.distancia_km !== null && zona.distancia_km !== undefined
        ? Number(zona.distancia_km)
        : null,
    };
  }
}

module.exports = new GeolocalizacionService();
