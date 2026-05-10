const hallazgosRepository = require('../repository/hallazgos.repository');
const usuariosClient = require('../clients/usuarios.client');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

const VENTANA_DUPLICADO_MS = 5 * 60 * 1000;

class HallazgosService {
  constructor() {
    this.reportesRecientes = new Map();
  }

  async crearHallazgo(data) {
    const usuarioId = data.u_id || data.U_ID;
    const tipo = data.h_tipo ?? data.H_Tipo;

    if (!usuarioId) {
      throw new AppError('u_id es obligatorio', 400);
    }

    if (tipo === undefined || tipo === null) {
      throw new AppError('h_tipo es obligatorio', 400);
    }

    const usuarioExiste = await usuariosClient.existeUsuario(usuarioId);

    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    logger.debug({
      usuario: this.ocultarUsuarioId(usuarioId),
      tipo,
      tieneImagen: Boolean(data.h_imagen || data.H_Imagen),
      tieneComuna: Boolean(data.h_comuna || data.H_Comuna)
    }, 'Creando reporte de hallazgo');

    const huella = this.construirHuellaHallazgo(data);
    this.registrarReporteReciente(huella);

    try {
      const hallazgoCreado = await hallazgosRepository.crearHallazgo(data);
      
      return {
        ...hallazgoCreado,
        tipoReporte: 'HALLADO'
      }
    } catch (error) {
      this.reportesRecientes.delete(huella);
      throw error;
    }
  }

  async listarHallazgos(filtros) {
    const hallazgos = await hallazgosRepository.listarHallazgos(filtros);

    return hallazgos.map((hallazgo) => ({
      ...hallazgo,
      tipoReporte: 'HALLADO'
    }))
  }

  async obtenerHallazgoPorId(id) {
    const hallazgo = await hallazgosRepository.obtenerHallazgoPorId(id);

    if (!hallazgo) {
      throw new AppError('Hallazgo no encontrado', 404);
    }

    const usuarioId = hallazgo.u_id || hallazgo.U_ID;

    let usuario = null;

    if (usuarioId) {
      usuario = await usuariosClient.obtenerUsuarioPorId(usuarioId);
    }

    return {
      ...hallazgo,
      usuario_nombre:
        usuario?.nombre ||
        usuario?.u_nombre ||
        usuario?.Nombre ||
        'Usuario no informado',
      usuario_id: usuarioId,
      tipoReporte: 'HALLADO'
    };
  }

  registrarReporteReciente(huella) {
    const ahora = Date.now();
    this.limpiarReportesRecientes(ahora);

    const fechaRegistro = this.reportesRecientes.get(huella);

    if (fechaRegistro && ahora - fechaRegistro < VENTANA_DUPLICADO_MS) {
      throw new AppError('Ya enviaste un reporte de hallazgo muy similar hace poco. Intenta nuevamente en unos minutos', 409);
    }

    this.reportesRecientes.set(huella, ahora);
  }

  limpiarReportesRecientes(ahora) {
    for (const [huella, fechaRegistro] of this.reportesRecientes.entries()) {
      if (ahora - fechaRegistro >= VENTANA_DUPLICADO_MS) {
        this.reportesRecientes.delete(huella);
      }
    }
  }

  construirHuellaHallazgo(data) {
    return JSON.stringify([
      this.normalizarValor(data.u_id || data.U_ID),
      this.normalizarValor(data.h_nom_masc || data.H_Nom_Masc),
      this.normalizarValor(data.h_tipo ?? data.H_Tipo),
      this.normalizarValor(data.h_edad ?? data.H_Edad),
      this.normalizarValor(data.h_genero ?? data.H_Genero),
      this.normalizarValor(data.h_fisica || data.H_Fisica),
      this.normalizarValor(data.h_perso || data.H_Perso),
      this.normalizarValor(data.h_inf_adic || data.H_Inf_Adic),
      this.normalizarValor(data.h_esterilizado ?? data.H_Esterilizado),
      this.normalizarValor(data.h_vacunas ?? data.H_Vacunas),
      this.normalizarValor(data.h_dire_inter || data.H_Dire_Inter),
      this.normalizarValor(data.h_comuna || data.H_Comuna),
      this.normalizarValor(data.h_region || data.H_Region),
      this.normalizarValor(data.h_fecha || data.H_Fecha)
    ]);
  }

  normalizarValor(valor) {
    if (valor === undefined || valor === null) {
      return '';
    }

    return String(valor).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  ocultarUsuarioId(usuarioId) {
    const valor = String(usuarioId || '');

    if (valor.length <= 5) {
      return valor ? '[OCULTO]' : '';
    }

    return `${valor.slice(0, 3)}***${valor.slice(-2)}`;
  }
}

module.exports = new HallazgosService();
