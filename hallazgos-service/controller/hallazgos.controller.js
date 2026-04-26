const hallazgosService = require('../services/hallazgos.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class HallazgosController {
  constructor() {
    this.crearHallazgo = this.crearHallazgo.bind(this);
    this.listarHallazgos = this.listarHallazgos.bind(this);
    this.obtenerHallazgoPorId = this.obtenerHallazgoPorId.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async crearHallazgo(req, res, next) {
    try {
      const data = await hallazgosService.crearHallazgo(req.body);
      return this.enviarRespuesta(res, data, 'Hallazgo creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarHallazgos(req, res, next) {
    try {
      const data = await hallazgosService.listarHallazgos(req.query);
      return this.enviarRespuesta(res, data, 'Hallazgos obtenidos correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerHallazgoPorId(req, res, next) {
    try {
      const data = await hallazgosService.obtenerHallazgoPorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Hallazgo obtenido correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HallazgosController();
