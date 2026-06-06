const AppError = require('../utils/AppError');

const GEOLOCALIZACION_SERVICE_URL = process.env.GEOLOCALIZACION_SERVICE_URL || 'http://localhost:3005';

class GeolocalizacionClient {
  tieneDatosUbicacion(data) {
    return data.geo_latitud !== undefined &&
      data.geo_longitud !== undefined &&
      data.geo_latitud !== null &&
      data.geo_longitud !== null;
  }

  construirUbicacionHallazgo(reporte, data, usuarioId) {
    return {
      tipo_reporte: 'HALLAZGO',
      reporte_id: reporte.h_id,
      u_id: usuarioId,
      geo_direccion: data.geo_direccion || data.h_dire_inter || data.H_Dire_Inter,
      geo_comuna: data.geo_comuna || data.h_comuna || data.H_Comuna,
      geo_region: data.geo_region || data.h_region || data.H_Region,
      geo_latitud: data.geo_latitud,
      geo_longitud: data.geo_longitud,
      geo_fuente: data.geo_fuente || 'MANUAL',
      geo_estado: data.geo_estado || 1
    };
  }

  async guardarUbicacionHallazgo(reporte, data, usuarioId) {
    if (!this.tieneDatosUbicacion(data)) {
      return null;
    }

    const response = await fetch(`${GEOLOCALIZACION_SERVICE_URL}/geolocalizacion/ubicaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Usuario-Id': usuarioId
      },
      body: JSON.stringify(this.construirUbicacionHallazgo(reporte, data, usuarioId))
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new AppError(json?.mensaje || 'No fue posible guardar la ubicacion del reporte', response.status);
    }

    return json?.respuesta || null;
  }
}

module.exports = new GeolocalizacionClient();
