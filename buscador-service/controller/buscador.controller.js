const buscadorService = require('../services/buscador.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class BuscadorController {
  async obtenerCoincidencias(req, res, next) {
    try {
      const data = await buscadorService.buscarCoincidencias(req.params.perdidaId);

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

module.exports = new BuscadorController();
