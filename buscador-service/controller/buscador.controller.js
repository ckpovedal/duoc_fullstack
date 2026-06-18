const buscadorService = require('../services/buscador.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class BuscadorController {
  async obtenerCoincidenciasPorParametros(req, res, next) {
    try {
      const data = await buscadorService.buscarCoincidenciasPorParametros(req.query);

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

  async obtenerCoincidenciasPorHallazgo(req, res, next) {
    try {
      const data = await buscadorService.buscarCoincidenciasPorHallazgo(req.params.hallazgoId);

      const respuesta = new RespuestaDTO().ok(
        data,
        'Coincidencias por hallazgo obtenidas correctamente',
        200
      );

      return res.status(200).json(respuesta);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BuscadorController();
