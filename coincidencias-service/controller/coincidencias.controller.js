const coincidenciasService = require('../services/coincidencias.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class CoincidenciasController {
  async obtenerCoincidencias(req, res, next) {
    try {
      const data = await coincidenciasService.buscarCoincidencias(req.params.reporteId);

      const respuesta = new RespuestaDTO().ok(
        data,
        'Coincidencias obtenidas correctamente',
        200
      );

      return res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CoincidenciasController();