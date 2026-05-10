const perdidasRepository = require('../repository/perdidas.repository');
const usuariosClient = require('../clients/usuarios.client');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

const VENTANA_DUPLICADO_MS = 5 * 60 * 1000;

class PerdidasService {
  constructor() {
    this.reportesRecientes = new Map();
  }

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

    const usuarioExiste = await usuariosClient.existeUsuario(usuarioId);
    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    logger.debug({
      usuario: this.ocultarUsuarioId(usuarioId),
      tipo,
      tieneImagen: Boolean(data.p_imagen || data.P_Imagen),
      tieneComuna: Boolean(data.p_comuna || data.P_Comuna)
    }, 'Creando reporte de perdida');

    const huella = this.construirHuellaPerdida(data);
    this.registrarReporteReciente(huella);

    try {
      const perdidaCreada = await perdidasRepository.crearPerdida(data);

      return {
        ...perdidaCreada,
        tipoReporte: 'PERDIDO'
      }
    } catch (error) {
      this.reportesRecientes.delete(huella);
      throw error;
    }
  }

  async listarPerdidas(filtros) {
    const perdidas = await perdidasRepository.listarPerdidas(filtros);

    return perdidas.map((perdida) => ({
      ...perdida,
      tipoReporte: 'PERDIDO'
    }))
  }

  async obtenerPerdidaPorId(id) {
    const perdida = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdida) {
      throw new AppError('Perdida no encontrada', 404);
    }

    return { 
      ...perdida,
      tipoReporte: 'PERDIDO'
    };
  }

  async actualizarPerdida(id, data) {
    const perdidaActual = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdidaActual) {
      throw new AppError('Perdida no encontrada', 404);
    }

    const datosActualizados = {
      ...perdidaActual,
      ...data,
    };

    const usuarioId = datosActualizados.u_id || datosActualizados.U_ID;
    const usuarioExiste = await usuariosClient.existeUsuario(usuarioId);

    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    const perdidaActualizada = await perdidasRepository.actualizarPerdida(id, datosActualizados);

    return {
      ...perdidaActualizada,
      tipoReporte: 'PERDIDO'
    };
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
    
    const resultado = await perdidasRepository.cambiarEstadoPerdida(id, estado);

    return {
      ...resultado,
      tipoReporte: 'PERDIDO'
    };
  }

  registrarReporteReciente(huella) {
    const ahora = Date.now();
    this.limpiarReportesRecientes(ahora);

    const fechaRegistro = this.reportesRecientes.get(huella);

    if (fechaRegistro && ahora - fechaRegistro < VENTANA_DUPLICADO_MS) {
      throw new AppError('Ya enviaste un reporte de perdida muy similar hace poco. Intenta nuevamente en unos minutos', 409);
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

  construirHuellaPerdida(data) {
    return JSON.stringify([
      this.normalizarValor(data.u_id || data.U_ID),
      this.normalizarValor(data.p_nom_masc || data.P_Nom_Masc),
      this.normalizarValor(data.p_tipo ?? data.P_Tipo),
      this.normalizarValor(data.p_edad ?? data.P_Edad),
      this.normalizarValor(data.p_genero ?? data.P_Genero),
      this.normalizarValor(data.p_fisica || data.P_Fisica),
      this.normalizarValor(data.p_perso || data.P_Perso),
      this.normalizarValor(data.p_inf_adic || data.P_Inf_Adic),
      this.normalizarValor(data.p_esterilizado ?? data.P_Esterilizado),
      this.normalizarValor(data.p_vacunas ?? data.P_Vacunas),
      this.normalizarValor(data.p_dire_inter || data.P_Dire_Inter),
      this.normalizarValor(data.p_comuna || data.P_Comuna),
      this.normalizarValor(data.p_region || data.P_Region),
      this.normalizarValor(data.p_fecha || data.P_Fecha)
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

module.exports = new PerdidasService();
