const perdidasRepository = require('../repository/perdidas.repository');
const usuariosClient = require('../clients/usuarios.client');
const geolocalizacionClient = require('../clients/geolocalizacion.client');
const buscadorClient = require('../clients/buscador.client');
const notificacionesClient = require('../clients/notificaciones.client');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

const VENTANA_DUPLICADO_MS = 5 * 60 * 1000;
const API_PUBLICA = process.env.API_PUBLIC_URL || 'http://localhost:3001/api';

class PerdidasService {
  constructor() {
    this.reportesRecientes = new Map();
  }

  async crearPerdida(data, usuarioAutenticadoId) {
    const usuarioId = usuarioAutenticadoId;
    const nombreMascota = data.p_nom_masc || data.P_Nom_Masc;
    const tipo = data.p_tipo ?? data.P_Tipo;

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
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

    const datosReporte = {
      ...data,
      u_id: usuarioId,
    };

    logger.debug({
      usuario: this.ocultarUsuarioId(usuarioId),
      tipo,
      tieneImagen: Boolean(data.p_imagen || data.P_Imagen),
      tieneComuna: Boolean(data.p_comuna || data.P_Comuna)
    }, 'Creando reporte de perdida');

    const huella = this.construirHuellaPerdida(datosReporte);
    this.registrarReporteReciente(huella);

    let perdidaCreada = null;

    try {
      perdidaCreada = await perdidasRepository.crearPerdida(datosReporte);
      const ubicacion = await geolocalizacionClient.guardarUbicacionPerdida(perdidaCreada, datosReporte, usuarioId);

      this.notificarCoincidenciasPerdida(perdidaCreada, usuarioId);

      return {
        ...this.normalizarImagenPerdida(perdidaCreada),
        tipoReporte: 'PERDIDO',
        ubicacion
      }
    } catch (error) {
      this.reportesRecientes.delete(huella);

      if (perdidaCreada?.p_id) {
        await perdidasRepository.eliminarPerdida(perdidaCreada.p_id);
        throw new AppError('Hubo un error al guardar la informacion del reporte', 500);
      }

      throw error;
    }
  }

  async notificarCoincidenciasPerdida(perdida, usuarioCreadorId) {
    try {
      const perdidaId = perdida.p_id || perdida.P_ID;
      const resultado = await buscadorClient.buscarCoincidenciasPorPerdida(perdidaId);
      const coincidencias = Array.isArray(resultado?.coincidencias) ? resultado.coincidencias : [];

      const relevantes = coincidencias.filter((coincidencia) =>
        String(coincidencia.tipoReporte || '').toUpperCase() === 'HALLADO' &&
        ['ALTA', 'MEDIA'].includes(String(coincidencia.nivel || '').toUpperCase())
      );

      const hallazgosNotificados = new Set();

      for (const coincidencia of relevantes) {
        const hallazgo = coincidencia.hallazgo || coincidencia.reporte || {};
        const hallazgoId = String(hallazgo.h_id || hallazgo.H_ID || '').trim();
        const usuarioHallazgoId = String(hallazgo.u_id || hallazgo.U_ID || '').trim();

        if (!hallazgoId || usuarioHallazgoId === String(usuarioCreadorId)) {
          continue;
        }

        if (hallazgosNotificados.has(hallazgoId)) {
          continue;
        }

        hallazgosNotificados.add(hallazgoId);

        await notificacionesClient.notificarCoincidencia({
          usuarioDestinoId: usuarioCreadorId,
          perdidaId,
          hallazgoId,
          nivel: coincidencia.nivel,
          origen: 'PERDIDA_PUBLICADA',
          resumen: this.construirResumenPerdida(perdida),
          criterios: coincidencia.criterios || []
        });
      }
    } catch (error) {
      logger.warn({
        error: {
          nombre: error.name,
          mensaje: error.message
        },
        perdidaId: perdida?.p_id || perdida?.P_ID
      }, 'No fue posible notificar coincidencias de la perdida');
    }
  }

  construirResumenPerdida(perdida) {
    const tipo = this.obtenerTipoTexto(perdida.p_tipo ?? perdida.P_Tipo);
    const comuna = perdida.p_comuna || perdida.P_Comuna || 'tu zona';

    return `Encontramos un ${tipo} hallado en ${comuna} que podria coincidir con tu reporte.`;
  }

  obtenerTipoTexto(tipo) {
    const tipos = {
      1: 'perro',
      2: 'gato',
      3: 'animal'
    };

    return tipos[Number(tipo)] || 'animal';
  }

  async listarPerdidas(filtros) {
    const perdidas = await perdidasRepository.listarPerdidas(filtros);

    return perdidas.map((perdida) => ({
      ...this.normalizarImagenPerdida(perdida),
      tipoReporte: 'PERDIDO'
    }))
  }

  async obtenerPerdidaPorId(id) {
    const perdida = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdida) {
      throw new AppError('Perdida no encontrada', 404);
    }

    const usuarioId = perdida.u_id || perdida.U_ID;

    let usuario = null;

    if (usuarioId) {
      usuario = await usuariosClient.obtenerUsuarioPorId(usuarioId);
    }

    return { 
      ...this.normalizarImagenPerdida(perdida),
      usuario_nombre:
        usuario?.nombre ||
        usuario?.u_nombre ||
        usuario?.Nombre ||
        'Usuario no informado',
      usuario_id: usuarioId,
      tipoReporte: 'PERDIDO'
    };
  }

  async obtenerImagenPerdida(id) {
    const imagen = await perdidasRepository.obtenerImagenPerdidaPorId(id);

    if (!imagen) {
      throw new AppError('Imagen no encontrada', 404);
    }

    const buffer = this.obtenerBufferImagen(imagen);

    if (!buffer) {
      throw new AppError('Imagen no encontrada', 404);
    }

    return {
      buffer,
      contentType: this.obtenerTipoImagen(buffer)
    };
  }

  async actualizarPerdida(id, data, usuarioAutenticadoId) {
    if (!usuarioAutenticadoId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    const perdidaActual = await perdidasRepository.obtenerPerdidaPorId(id);

    if (!perdidaActual) {
      throw new AppError('Perdida no encontrada', 404);
    }

    if (String(perdidaActual.u_id || perdidaActual.U_ID) !== String(usuarioAutenticadoId)) {
      throw new AppError('No puedes editar un reporte de otro usuario', 403);
    }

    const datosActualizados = {
      ...perdidaActual,
      ...data,
      u_id: usuarioAutenticadoId,
    };

    const usuarioId = datosActualizados.u_id || datosActualizados.U_ID;
    const usuarioExiste = await usuariosClient.existeUsuario(usuarioId);

    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    const perdidaActualizada = await perdidasRepository.actualizarPerdida(id, datosActualizados);

    return {
      ...this.normalizarImagenPerdida(perdidaActualizada),
      tipoReporte: 'PERDIDO'
    };
  }

  async cambiarEstado(id, data, usuarioAutenticadoId) {
    if (!usuarioAutenticadoId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    const estado = data.p_estado ?? data.P_Estado ?? data.estado ?? data.nuevoEstado;

    if (estado === undefined || estado === null) {
      throw new AppError('estado es obligatorio', 400);
    }

    const perdida = await perdidasRepository.obtenerPerdidaPorId(id);
    if (!perdida) {
      throw new AppError('Perdida no encontrada', 404);
    }

    if (String(perdida.u_id || perdida.U_ID) !== String(usuarioAutenticadoId)) {
      throw new AppError('No puedes cambiar el estado de un reporte de otro usuario', 403);
    }
    
    const resultado = await perdidasRepository.cambiarEstadoPerdida(id, estado);

    return {
      ...this.normalizarImagenPerdida(resultado),
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

  normalizarImagenPerdida(perdida) {
    const id = perdida.p_id ?? perdida.P_ID;
    const imagen = perdida.p_imagen ?? perdida.P_Imagen;

    return {
      ...perdida,
      p_imagen: id && imagen ? `${API_PUBLICA}/perdidas/${id}/imagen` : null
    };
  }

  obtenerBufferImagen(imagen) {
    if (Buffer.isBuffer(imagen)) {
      return imagen;
    }

    if (imagen?.type === 'Buffer' && Array.isArray(imagen.data)) {
      return Buffer.from(imagen.data);
    }

    if (typeof imagen === 'string' && imagen.startsWith('data:image/')) {
      const base64 = imagen.split(',')[1];
      return base64 ? Buffer.from(base64, 'base64') : null;
    }

    if (typeof imagen === 'string' && imagen.startsWith('\\x')) {
      return Buffer.from(imagen.slice(2), 'hex');
    }

    return null;
  }

  obtenerTipoImagen(buffer) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      return 'image/gif';
    }

    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      return 'image/webp';
    }

    return 'image/jpeg';
  }
}

module.exports = new PerdidasService();
