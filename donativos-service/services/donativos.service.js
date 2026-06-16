const donativosRepository = require('../repository/donativos.repository');
const AppError = require('../utils/AppError');

class DonativosService {
  async crearDonativo(data, usuarioAutenticadoId) {
    const nombre = this.obtenerTexto(data.nombre || data.d_nombre_donante || data.D_NOMBRE_DONANTE);
    const correo = this.obtenerTexto(data.correo || data.email || data.d_correo_donante || data.D_CORREO_DONANTE);
    const mensaje = this.obtenerTexto(data.mensaje || data.d_mensaje || data.D_MENSAJE);
    const monto = Number(data.monto ?? data.d_monto ?? data.D_MONTO);

    if (!nombre) {
      throw new AppError('nombre es obligatorio', 400);
    }

    if (!correo) {
      throw new AppError('correo es obligatorio', 400);
    }

    if (!Number.isFinite(monto) || monto <= 0) {
      throw new AppError('monto debe ser mayor a 0', 400);
    }

    const donativo = await donativosRepository.crearDonativo({
      u_id: usuarioAutenticadoId || null,
      d_nombre_donante: nombre,
      d_correo_donante: correo,
      d_monto: Math.round(monto),
      d_moneda: 'CLP',
      d_mensaje: mensaje || null,
      d_estado: 2,
      d_metodo_pago: 'SIMULADO'
    });

    return donativo;
  }

  async obtenerResumen() {
    return donativosRepository.obtenerResumen();
  }

  async listarMisDonativos(usuarioAutenticadoId) {
    if (!usuarioAutenticadoId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    return donativosRepository.listarPorUsuario(usuarioAutenticadoId);
  }

  async listarDonativosAdmin(adminAutorizado) {
    this.validarAdmin(adminAutorizado);
    return donativosRepository.listarTodos();
  }

  async obtenerDonativoAdmin(id, adminAutorizado) {
    this.validarAdmin(adminAutorizado);

    const donativo = await donativosRepository.obtenerPorId(id);

    if (!donativo) {
      throw new AppError('Donativo no encontrado', 404);
    }

    return donativo;
  }

  validarAdmin(adminAutorizado) {
    if (String(adminAutorizado || '').toLowerCase() !== 'true') {
      throw new AppError('No tienes permisos para acceder a donativos', 403);
    }
  }

  obtenerTexto(valor) {
    return String(valor ?? '').trim();
  }
}

module.exports = new DonativosService();
