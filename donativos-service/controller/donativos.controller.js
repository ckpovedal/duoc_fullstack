const donativosService = require('../services/donativos.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class DonativosController {
  constructor() {
    this.crearDonativo = this.crearDonativo.bind(this);
    this.obtenerResumen = this.obtenerResumen.bind(this);
    this.listarMisDonativos = this.listarMisDonativos.bind(this);
    this.listarDonativosAdmin = this.listarDonativosAdmin.bind(this);
    this.obtenerDonativoAdmin = this.obtenerDonativoAdmin.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async crearDonativo(req, res, next) {
    try {
      const data = await donativosService.crearDonativo(req.body, req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Donativo registrado correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async obtenerResumen(req, res, next) {
    try {
      const data = await donativosService.obtenerResumen();
      return this.enviarRespuesta(res, data, 'Resumen de donativos obtenido correctamente');
    } catch (error) {
      next(error);
    }
  }

  async listarMisDonativos(req, res, next) {
    try {
      const data = await donativosService.listarMisDonativos(req.headers['x-usuario-id']);
      return this.enviarRespuesta(res, data, 'Donativos del usuario obtenidos correctamente');
    } catch (error) {
      next(error);
    }
  }

  async listarDonativosAdmin(req, res, next) {
    try {
      const data = await donativosService.listarDonativosAdmin(req.headers['x-admin-autorizado']);
      return this.enviarRespuesta(res, data, 'Donativos obtenidos correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerDonativoAdmin(req, res, next) {
    try {
      const data = await donativosService.obtenerDonativoAdmin(req.params.id, req.headers['x-admin-autorizado']);
      return this.enviarRespuesta(res, data, 'Donativo obtenido correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DonativosController();
