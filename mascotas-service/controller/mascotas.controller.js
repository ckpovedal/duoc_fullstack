const mascotasService = require('../services/mascotas.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class MascotasController {
  constructor() {
    this.crearMascota = this.crearMascota.bind(this);
    this.listarMascotas = this.listarMascotas.bind(this);
    this.obtenerMascotaPorId = this.obtenerMascotaPorId.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async crearMascota(req, res, next) {
    try {
      const data = await mascotasService.crearMascota(req.body);
      return this.enviarRespuesta(res, data, 'Mascota creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarMascotas(req, res, next) {
    try {
      const data = await mascotasService.listarMascotas();
      return this.enviarRespuesta(res, data, 'Mascotas obtenidas correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerMascotaPorId(req, res, next) {
    try {
      const data = await mascotasService.obtenerMascotaPorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Mascota obtenida correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MascotasController();