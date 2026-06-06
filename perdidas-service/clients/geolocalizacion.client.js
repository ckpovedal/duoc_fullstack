const AppError = require('../utils/AppError');

const GEOLOCALIZACION_SERVICE_URL = process.env.GEOLOCALIZACION_SERVICE_URL || 'http://localhost:3005';

class GeolocalizacionClient {
  tieneDatosUbicacion(data) {
    return data.geo_latitud !== undefined &&
      data.geo_longitud !== undefined &&
      data.geo_latitud !== null &&
      data.geo_longitud !== null;
  }

  construirUbicacionPerdida(reporte, data, usuarioId) {
    return {
      tipo_reporte: 'PERDIDA',
      reporte_id: reporte.p_id,
      u_id: usuarioId,
      geo_direccion: data.geo_direccion || data.p_dire_inter || data.P_Dire_Inter,
      geo_comuna: data.geo_comuna || data.p_comuna || data.P_Comuna,
      geo_region: data.geo_region || data.p_region || data.P_Region,
      geo_latitud: data.geo_latitud,
      geo_longitud: data.geo_longitud,
      geo_fuente: data.geo_fuente || 'MANUAL',
      geo_estado: data.geo_estado || 1
    };
  }

  async guardarUbicacionPerdida(reporte, data, usuarioId) {
    if (!this.tieneDatosUbicacion(data)) {
      return null;
    }

    const response = await fetch(`${GEOLOCALIZACION_SERVICE_URL}/geolocalizacion/ubicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario-Id': usuarioId
      },
      body: JSON.stringify(this.construirUbicacionPerdida(reporte, data, usuarioId))
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new AppError(json?.mensaje || 'No fue posible guardar la ubicacion del reporte', response.status);
    }

    return json?.respuesta || null;
  }
}

module.exports = new GeolocalizacionClient();
