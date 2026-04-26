const perdidasRepository = require('../repository/perdidas.repository');
const AppError = require('../utils/AppError');

class PerdidasService {
  async crearPerdida(data) {
    const usuarioId = data.u_id || data.U_ID;
    const nombreMascota = data.p_nom_masc || data.P_Nom_Masc;
    const tipo = data.p_tipo ?? data.P_Tipo;

    if (!usuarioId) {
      throw new AppError('u_id es obligatorio', 400);
    }

    if (!nombreMascota) {
      throw new AppError('p_nom_masc es obligatorio', 400);
    }

    if (tipo === undefined || tipo === null) {
      throw new AppError('p_tipo es obligatorio', 400);
    }

    const usuarioExiste = await perdidasRepository.existeUsuario(usuarioId);
    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    return await perdidasRepository.crearPerdida(data);
  }

  async listarPerdidas(filtros) {
    return await perdidasRepository.listarPerdidas(filtros);
  }

  async obtenerPerdidaPorId(id) {
    const perdida = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdida) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return perdida;
  }

  async actualizarPerdida(id, data) {
    const perdidaActual = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdidaActual) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return await perdidasRepository.actualizarPerdida(id, {
      ...perdidaActual,
      ...data,
    });
  }

  async cambiarEstado(id, data) {
    const estado = data.p_estado ?? data.P_Estado ?? data.estado ?? data.nuevoEstado;

    if (estado === undefined || estado === null) {
      throw new AppError('estado es obligatorio', 400);
    }

    const perdida = await perdidasRepository.obtenerPerdidaPorId(id);
    if (!perdida) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return await perdidasRepository.cambiarEstadoPerdida(id, estado);
  }
}

module.exports = new PerdidasService();
