const notificacionesService = require('../services/notificaciones.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class NotificacionesController {
  constructor() {
    this.registrarDispositivo = this.registrarDispositivo.bind(this);
    this.desactivarDispositivo = this.desactivarDispositivo.bind(this);
    this.listarNotificaciones = this.listarNotificaciones.bind(this);
    this.marcarLeida = this.marcarLeida.bind(this);
    this.enviarPrueba = this.enviarPrueba.bind(this);
    this.notificarMensaje = this.notificarMensaje.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async registrarDispositivo(req, res, next) {
    try {
      const data = await notificacionesService.registrarDispositivo(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Dispositivo registrado correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async desactivarDispositivo(req, res, next) {
    try {
      const data = await notificacionesService.desactivarDispositivo(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Dispositivo desactivado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async listarNotificaciones(req, res, next) {
    try {
      const data = await notificacionesService.listarNotificaciones(req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Notificaciones obtenidas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async marcarLeida(req, res, next) {
    try {
      const data = await notificacionesService.marcarLeida(req.params.id, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Notificacion marcada como leida');
    } catch (error) {
      next(error);
    }
  }

  async enviarPrueba(req, res, next) {
    try {
      const data = await notificacionesService.enviarPrueba(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Notificacion de prueba procesada', 201);
    } catch (error) {
      next(error);
    }
  }

  async notificarMensaje(req, res, next) {
    try {
      const data = await notificacionesService.notificarMensaje(req.body, req.headers['x-internal-token']);
      return this.enviarRespuesta(res, data, 'Notificacion de mensaje procesada', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificacionesController();
