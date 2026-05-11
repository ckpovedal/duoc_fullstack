const perdidasService = require('../services/perdidas.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class PerdidasController {
  constructor() {
    this.crearPerdida = this.crearPerdida.bind(this);
    this.listarPerdidas = this.listarPerdidas.bind(this);
    this.obtenerPerdidaPorId = this.obtenerPerdidaPorId.bind(this);
    this.actualizarPerdida = this.actualizarPerdida.bind(this);
    this.cambiarEstado = this.cambiarEstado.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async crearPerdida(req, res, next) {
    try {
      const data = await perdidasService.crearPerdida(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Reporte de perdida de mascota creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarPerdidas(req, res, next) {
    try {
      const data = await perdidasService.listarPerdidas(req.query);
      return this.enviarRespuesta(res, data, 'Reporte de Perdidas de mascota obtenidas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerPerdidaPorId(req, res, next) {
    try {
      const data = await perdidasService.obtenerPerdidaPorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Reporte de Perdida de mascota obtenida correctamente');
    } catch (error) {
      next(error);
    }
  }

  async actualizarPerdida(req, res, next) {
    try {
      const data = await perdidasService.actualizarPerdida(req.params.id, req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Reporte de Perdida de mascota actualizada correctamente');
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const data = await perdidasService.cambiarEstado(req.params.id, req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Estado actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PerdidasController();
