const hallazgosRepository = require('../repository/hallazgos.repository');
const AppError = require('../utils/AppError');

class HallazgosService {
  async crearHallazgo(data) {
    const usuarioId = data.u_id || data.U_ID;
    const tipo = data.h_tipo ?? data.H_Tipo;

    if (!usuarioId) {
      throw new AppError('u_id es obligatorio', 400);
    }

    if (tipo === undefined || tipo === null) {
      throw new AppError('h_tipo es obligatorio', 400);
    }

    const usuarioExiste = await hallazgosRepository.existeUsuario(usuarioId);

    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    return await hallazgosRepository.crearHallazgo(data);
  }

  async listarHallazgos(filtros) {
    return await hallazgosRepository.listarHallazgos(filtros);
  }

  async obtenerHallazgoPorId(id) {
    const hallazgo = await hallazgosRepository.obtenerHallazgoPorId(id);

    if (!hallazgo) {
      throw new AppError('Hallazgo no encontrado', 404);
    }

    return hallazgo;
  }
}

module.exports = new HallazgosService();
