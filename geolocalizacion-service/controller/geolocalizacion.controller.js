const geolocalizacionService = require('../services/geolocalizacion.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class GeolocalizacionController {
  constructor() {
    this.geocodificar = this.geocodificar.bind(this);
    this.geocodificarInversa = this.geocodificarInversa.bind(this);
    this.guardarUbicacion = this.guardarUbicacion.bind(this);
    this.listarUbicaciones = this.listarUbicaciones.bind(this);
    this.obtenerUbicacionPorId = this.obtenerUbicacionPorId.bind(this);
    this.obtenerUbicacionPorReporte = this.obtenerUbicacionPorReporte.bind(this);
    this.actualizarUbicacion = this.actualizarUbicacion.bind(this);
    this.cambiarEstadoUbicacion = this.cambiarEstadoUbicacion.bind(this);
    this.crearZonaInteres = this.crearZonaInteres.bind(this);
    this.listarZonasInteres = this.listarZonasInteres.bind(this);
    this.obtenerZonaInteresPorId = this.obtenerZonaInteresPorId.bind(this);
    this.actualizarZonaInteres = this.actualizarZonaInteres.bind(this);
    this.cambiarEstadoZonaInteres = this.cambiarEstadoZonaInteres.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async geocodificar(req, res, next) {
    try {
      const data = await geolocalizacionService.geocodificar({ ...req.query, ...req.body });
      return this.enviarRespuesta(res, data, 'Direccion geocodificada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async geocodificarInversa(req, res, next) {
    try {
      const data = await geolocalizacionService.geocodificarInversa({ ...req.query, ...req.body });
      return this.enviarRespuesta(res, data, 'Coordenadas geocodificadas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async guardarUbicacion(req, res, next) {
    try {
      const data = await geolocalizacionService.guardarUbicacion(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Ubicacion guardada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarUbicaciones(req, res, next) {
    try {
      const data = await geolocalizacionService.listarUbicaciones(req.query);
      return this.enviarRespuesta(res, data, 'Ubicaciones obtenidas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerUbicacionPorId(req, res, next) {
    try {
      const data = await geolocalizacionService.obtenerUbicacionPorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Ubicacion obtenida correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerUbicacionPorReporte(req, res, next) {
    try {
      const data = await geolocalizacionService.obtenerUbicacionPorReporte(
        req.params.tipoReporte,
        req.params.reporteId
      );
      return this.enviarRespuesta(res, data, 'Ubicacion de reporte obtenida correctamente');
    } catch (error) {
      next(error);
    }
  }

  async actualizarUbicacion(req, res, next) {
    try {
      const data = await geolocalizacionService.actualizarUbicacion(
        req.params.id,
        req.body,
        req.headers['x-usuario-id']
      );
      return this.enviarRespuesta(res, data, 'Ubicacion actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstadoUbicacion(req, res, next) {
    try {
      const data = await geolocalizacionService.cambiarEstadoUbicacion(
        req.params.id,
        req.body,
        req.headers['x-usuario-id']
      );
      return this.enviarRespuesta(res, data, 'Estado de ubicacion actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async crearZonaInteres(req, res, next) {
    try {
      const data = await geolocalizacionService.crearZonaInteres(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Zona de interes creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarZonasInteres(req, res, next) {
    try {
      const data = await geolocalizacionService.listarZonasInteres(req.query);
      return this.enviarRespuesta(res, data, 'Zonas de interes obtenidas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerZonaInteresPorId(req, res, next) {
    try {
      const data = await geolocalizacionService.obtenerZonaInteresPorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Zona de interes obtenida correctamente');
    } catch (error) {
      next(error);
    }
  }

  async actualizarZonaInteres(req, res, next) {
    try {
      const data = await geolocalizacionService.actualizarZonaInteres(
        req.params.id,
        req.body,
        req.headers['x-usuario-id']
      );
      return this.enviarRespuesta(res, data, 'Zona de interes actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstadoZonaInteres(req, res, next) {
    try {
      const data = await geolocalizacionService.cambiarEstadoZonaInteres(
        req.params.id,
        req.body,
        req.headers['x-usuario-id']
      );
      return this.enviarRespuesta(res, data, 'Estado de zona de interes actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GeolocalizacionController();
