const notificacionesRepository = require('../repository/notificaciones.repository');
const firebaseService = require('./firebase.service');
const socketService = require('./socket.service');
const AppError = require('../utils/AppError');

class NotificacionesService {
  async registrarDispositivo(data, usuarioAutenticadoId) {
    const usuarioId = this.obtenerTexto(usuarioAutenticadoId);
    const token = this.obtenerTexto(data.token || data.dp_token || data.DP_TOKEN);
    const plataforma = this.obtenerTexto(data.plataforma || data.dp_plataforma || data.DP_PLATAFORMA || 'ANDROID').toUpperCase();
    const modelo = this.obtenerTexto(data.modelo || data.dp_modelo || data.DP_MODELO);

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (!token) {
      throw new AppError('token es obligatorio', 400);
    }

    if (!['ANDROID', 'WEB'].includes(plataforma)) {
      throw new AppError('plataforma debe ser ANDROID o WEB', 400);
    }

    return notificacionesRepository.registrarDispositivo({
      u_id: usuarioId,
      dp_token: token,
      dp_plataforma: plataforma,
      dp_modelo: modelo || null
    });
  }

  async desactivarDispositivo(data, usuarioAutenticadoId) {
    const usuarioId = this.obtenerTexto(usuarioAutenticadoId);
    const token = this.obtenerTexto(data.token || data.dp_token || data.DP_TOKEN);

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (!token) {
      throw new AppError('token es obligatorio', 400);
    }

    const dispositivo = await notificacionesRepository.desactivarDispositivo(usuarioId, token);

    if (!dispositivo) {
      throw new AppError('Dispositivo no encontrado', 404);
    }

    return dispositivo;
  }

  async listarNotificaciones(usuarioAutenticadoId) {
    const usuarioId = this.obtenerTexto(usuarioAutenticadoId);

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    return notificacionesRepository.listarNotificaciones(usuarioId);
  }

  async marcarLeida(id, usuarioAutenticadoId) {
    const usuarioId = this.obtenerTexto(usuarioAutenticadoId);
    const notificacionId = this.obtenerTexto(id);

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    if (!notificacionId) {
      throw new AppError('id es obligatorio', 400);
    }

    const notificacion = await notificacionesRepository.marcarLeida(notificacionId, usuarioId);

    if (!notificacion) {
      throw new AppError('Notificacion no encontrada', 404);
    }

    socketService.emitirNotificacionLeida(usuarioId, notificacion);

    return notificacion;
  }

  async enviarPrueba(data, usuarioAutenticadoId) {
    const usuarioId = this.obtenerTexto(usuarioAutenticadoId);

    if (!usuarioId) {
      throw new AppError('Debes iniciar sesion', 401);
    }

    return this.crearYEnviar({
      usuarioDestinoId: usuarioId,
      titulo: this.obtenerTexto(data.titulo) || 'Sanos y Salvos',
      cuerpo: this.obtenerTexto(data.cuerpo) || 'Notificacion de prueba',
      tipo: 'SISTEMA',
      data: {
        tipo: 'SISTEMA'
      }
    });
  }

  async notificarMensaje(data, internalToken) {
    this.validarTokenInterno(internalToken);

    const usuarioDestinoId = this.obtenerTexto(data.usuarioDestinoId || data.uIdReceptor || data.u_id_receptor);
    const emisorId = this.obtenerTexto(data.usuarioEmisorId || data.uIdEmisor || data.u_id_emisor);
    const conversacionId = this.obtenerTexto(data.conversacionId || data.convId || data.conv_id);
    const mensajeId = this.obtenerTexto(data.mensajeId || data.msgId || data.msg_id);
    const contenido = this.obtenerTexto(data.contenido || data.msgContenido || data.msg_contenido);

    if (!usuarioDestinoId || !emisorId || !conversacionId || !mensajeId) {
      throw new AppError('Faltan datos obligatorios para notificar mensaje', 400);
    }

    return this.crearYEnviar({
      usuarioDestinoId,
      titulo: 'Nuevo mensaje',
      cuerpo: contenido ? this.recortarTexto(contenido, 120) : 'Tienes un nuevo mensaje',
      tipo: 'MENSAJE',
      data: {
        tipo: 'MENSAJE',
        conversacionId,
        mensajeId,
        usuarioEmisorId: emisorId
      }
    });
  }

  async notificarCoincidencia(data, internalToken) {
    this.validarTokenInterno(internalToken);

    const usuarioDestinoId = this.obtenerTexto(data.usuarioDestinoId || data.uIdDestino || data.u_id_destino);
    const perdidaId = this.obtenerTexto(data.perdidaId || data.pId || data.p_id);
    const hallazgoId = this.obtenerTexto(data.hallazgoId || data.hId || data.h_id);
    const nivel = this.obtenerTexto(data.nivel || 'MEDIA').toUpperCase();
    const origen = this.obtenerTexto(data.origen || 'COINCIDENCIA').toUpperCase();
    const resumen = this.obtenerTexto(data.resumen);
    const criterios = Array.isArray(data.criterios) ? data.criterios : [];

    if (!usuarioDestinoId || !perdidaId || !hallazgoId) {
      throw new AppError('Faltan datos obligatorios para notificar coincidencia', 400);
    }

    const cuerpo = this.obtenerCuerpoCoincidencia(origen, resumen);

    return this.crearYEnviar({
      usuarioDestinoId,
      titulo: 'Posible coincidencia encontrada',
      cuerpo,
      tipo: 'COINCIDENCIA',
      data: {
        tipo: 'COINCIDENCIA',
        perdidaId,
        hallazgoId,
        nivel,
        origen,
        criterios: criterios.join(', ')
      }
    });
  }

  async crearYEnviar({ usuarioDestinoId, titulo, cuerpo, tipo, data }) {
    const preferencias = await notificacionesRepository.obtenerPreferencias(usuarioDestinoId);

    if (!this.notificacionPermitida(tipo, preferencias)) {
      const notificacion = await notificacionesRepository.crearNotificacion({
        u_id_destino: usuarioDestinoId,
        not_titulo: titulo,
        not_cuerpo: cuerpo,
        not_tipo: tipo,
        not_data: data,
        not_enviada: 3,
        not_error: 'Notificacion desactivada por preferencias'
      });

      socketService.emitirNotificacionNueva(usuarioDestinoId, notificacion);

      return notificacion;
    }

    const dispositivos = await notificacionesRepository.listarDispositivosActivos(usuarioDestinoId);
    const tokens = dispositivos.map((dispositivo) => dispositivo.dp_token).filter(Boolean);
    const envio = await firebaseService.enviarATokens(tokens, {
      titulo,
      cuerpo,
      data
    });

    const notificacion = await notificacionesRepository.crearNotificacion({
      u_id_destino: usuarioDestinoId,
      not_titulo: titulo,
      not_cuerpo: cuerpo,
      not_tipo: tipo,
      not_data: data,
      not_enviada: envio.enviado ? 1 : 3,
      not_error: envio.error,
      not_fecha_envio: envio.enviado ? new Date() : null
    });

    socketService.emitirNotificacionNueva(usuarioDestinoId, notificacion);

    return notificacion;
  }

  obtenerCuerpoCoincidencia(origen, resumen) {
    if (resumen) {
      return this.recortarTexto(resumen, 180);
    }

    if (origen === 'HALLAZGO_PUBLICADO') {
      return 'Se publico una mascota hallada similar a tu reporte de perdida.';
    }

    if (origen === 'PERDIDA_PUBLICADA') {
      return 'Encontramos una mascota hallada similar a tu nuevo reporte de perdida.';
    }

    return 'Hay una posible coincidencia entre una mascota perdida y una mascota hallada.';
  }

  notificacionPermitida(tipo, preferencias) {
    if (tipo === 'MENSAJE') {
      return Number(preferencias.pref_mensajes) === 1;
    }

    if (tipo === 'COINCIDENCIA') {
      return Number(preferencias.pref_coincidencias) === 1;
    }

    if (tipo === 'SISTEMA') {
      return Number(preferencias.pref_sistema) === 1;
    }

    return true;
  }

  validarTokenInterno(token) {
    const esperado = process.env.INTERNAL_SERVICE_TOKEN;

    if (!esperado) {
      throw new AppError('No hay token interno configurado', 500);
    }

    if (this.obtenerTexto(token) !== esperado) {
      throw new AppError('Token interno invalido', 401);
    }
  }

  recortarTexto(texto, maximo) {
    if (texto.length <= maximo) {
      return texto;
    }

    return `${texto.slice(0, maximo - 3)}...`;
  }

  obtenerTexto(valor) {
    return String(valor ?? '').trim();
  }
}

module.exports = new NotificacionesService();
