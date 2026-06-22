const hallazgosRepository = require('../repository/hallazgos.repository');
const usuariosClient = require('../clients/usuarios.client');
const geolocalizacionClient = require('../clients/geolocalizacion.client');
const buscadorClient = require('../clients/buscador.client');
const notificacionesClient = require('../clients/notificaciones.client');
const AppError = require('../utils/AppError');
const { logger } = require('../middleware/logger');

const VENTANA_DUPLICADO_MS = 5 * 60 * 1000;

class HallazgosService {
  constructor() {
    this.reportesRecientes = new Map();
  }

  async crearHallazgo(data, usuarioAutenticadoId) {
    const usuarioId = usuarioAutenticadoId;
    const tipo = data.h_tipo ?? data.H_Tipo;

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (tipo === undefined || tipo === null) {
      throw new AppError('h_tipo es obligatorio', 400);
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
      tieneImagen: Boolean(data.h_imagen || data.H_Imagen),
      tieneComuna: Boolean(data.h_comuna || data.H_Comuna)
    }, 'Creando reporte de hallazgo');

    const huella = this.construirHuellaHallazgo(datosReporte);
    this.registrarReporteReciente(huella);

    let hallazgoCreado = null;

    try {
      hallazgoCreado = await hallazgosRepository.crearHallazgo(datosReporte);
      const ubicacion = await geolocalizacionClient.guardarUbicacionHallazgo(hallazgoCreado, datosReporte, usuarioId);

      this.notificarCoincidenciasHallazgo(hallazgoCreado, usuarioId);
      
      return {
        ...this.normalizarImagenHallazgo(hallazgoCreado),
        tipoReporte: 'HALLADO',
        ubicacion
      }
    } catch (error) {
      this.reportesRecientes.delete(huella);

      if (hallazgoCreado?.h_id) {
        await hallazgosRepository.eliminarHallazgo(hallazgoCreado.h_id);
        throw new AppError('Hubo un error al guardar la informacion del reporte', 500);
      }

      throw error;
    }
  }

  async notificarCoincidenciasHallazgo(hallazgo, usuarioCreadorId) {
    try {
      const hallazgoId = hallazgo.h_id || hallazgo.H_ID;
      const resultado = await buscadorClient.buscarCoincidenciasPorHallazgo(hallazgoId);
      const coincidencias = Array.isArray(resultado?.coincidencias) ? resultado.coincidencias : [];

      const relevantes = coincidencias.filter((coincidencia) =>
        ['ALTA', 'MEDIA'].includes(String(coincidencia.nivel || '').toUpperCase()) &&
        this.coincidenciaNotificable(coincidencia)
      );

      const usuariosNotificados = new Set();

      for (const coincidencia of relevantes) {
        const perdida = coincidencia.perdida || coincidencia.reporte || {};
        const usuarioDestinoId = String(perdida.u_id || perdida.U_ID || '').trim();
        const perdidaId = String(perdida.p_id || perdida.P_ID || '').trim();
        const tipoHallazgo = hallazgo.h_tipo ?? hallazgo.H_Tipo;
        const tipoPerdida = perdida.p_tipo ?? perdida.P_Tipo;

        if (!usuarioDestinoId || !perdidaId || usuarioDestinoId === String(usuarioCreadorId)) {
          continue;
        }

        if (!this.tiposIguales(tipoHallazgo, tipoPerdida)) {
          continue;
        }

        if (usuariosNotificados.has(`${usuarioDestinoId}:${perdidaId}`)) {
          continue;
        }

        usuariosNotificados.add(`${usuarioDestinoId}:${perdidaId}`);

        await notificacionesClient.notificarCoincidencia({
          usuarioDestinoId,
          perdidaId,
          hallazgoId,
          nivel: coincidencia.nivel,
          origen: 'HALLAZGO_PUBLICADO',
          resumen: this.construirResumenHallazgo(hallazgo),
          criterios: coincidencia.criterios || []
        });
      }
    } catch (error) {
      logger.warn({
        error: {
          nombre: error.name,
          mensaje: error.message
        },
        hallazgoId: hallazgo?.h_id || hallazgo?.H_ID
      }, 'No fue posible notificar coincidencias del hallazgo');
    }
  }

  coincidenciaNotificable(coincidencia) {
    const criterios = Array.isArray(coincidencia.criterios) ? coincidencia.criterios : [];

    return this.tieneCriterioAdicional(criterios);
  }

  tieneCriterioAdicional(criterios) {
    return criterios.some((criterio) => String(criterio || '').trim().toLowerCase() !== 'mismo tipo');
  }

  tiposIguales(tipoA, tipoB) {
    if (tipoA === undefined || tipoA === null || tipoB === undefined || tipoB === null) {
      return false;
    }

    return String(tipoA).trim().toLowerCase() === String(tipoB).trim().toLowerCase();
  }

  construirResumenHallazgo(hallazgo) {
    const tipo = this.obtenerTipoTexto(hallazgo.h_tipo ?? hallazgo.H_Tipo);
    const comuna = hallazgo.h_comuna || hallazgo.H_Comuna || 'tu zona';

    return `Se publico un ${tipo} hallado en ${comuna} que podria coincidir con tu reporte.`;
  }

  obtenerTipoTexto(tipo) {
    const tipos = {
      1: 'perro',
      2: 'gato',
      3: 'animal'
    };

    return tipos[Number(tipo)] || 'animal';
  }

  async listarHallazgos(filtros) {
    const resultado = await hallazgosRepository.listarHallazgos(filtros);

    return {
      ...resultado,
      items: resultado.items.map((hallazgo) => ({
        ...this.normalizarImagenHallazgo(hallazgo),
        tipoReporte: 'HALLADO'
      }))
    };
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
      ...this.normalizarImagenHallazgo(hallazgo),
      usuario_nombre:
        usuario?.nombre ||
        usuario?.u_nombre ||
        usuario?.Nombre ||
        'Usuario no informado',
      usuario_id: usuarioId,
      tipoReporte: 'HALLADO'
    };
  }

  async obtenerImagenHallazgo(id) {
    const imagen = await hallazgosRepository.obtenerImagenHallazgoPorId(id);

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

  async actualizarHallazgo(id, data, usuarioAutenticadoId) {
    if (!usuarioAutenticadoId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    const hallazgoActual = await hallazgosRepository.obtenerHallazgoPorId(id);

    if (!hallazgoActual) {
      throw new AppError('Hallazgo no encontrado', 404);
    }

    if (String(hallazgoActual.u_id || hallazgoActual.U_ID) !== String(usuarioAutenticadoId)) {
      throw new AppError('No puedes editar un reporte de otro usuario', 403);
    }

    const datosActualizados = {
      ...hallazgoActual,
      ...data,
      u_id: usuarioAutenticadoId,
    };

    const usuarioId = datosActualizados.u_id || datosActualizados.U_ID;
    const usuarioExiste = await usuariosClient.existeUsuario(usuarioId);

    if (!usuarioExiste) {
      throw new AppError('El usuario indicado no existe', 404);
    }

    const hallazgoActualizado = await hallazgosRepository.actualizarHallazgo(id, datosActualizados);

    return {
      ...this.normalizarImagenHallazgo(hallazgoActualizado),
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

  normalizarImagenHallazgo(hallazgo) {
    const id = hallazgo.h_id ?? hallazgo.H_ID;
    const imagen = hallazgo.h_imagen ?? hallazgo.H_Imagen;

    return {
      ...hallazgo,
      h_imagen: id && imagen ? `/hallazgos/${id}/imagen` : null
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

module.exports = new HallazgosService();