const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { Server } = require('socket.io');
const pool = require('./db');
const notificacionesClient = require('./clients/notificaciones.client');

const app = express();
const server = http.createServer(app);
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const port = Number(process.env.MENSAJERIA_SERVICE_PORT) || 3006;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: allowedOrigins.length === 0 ? true : allowedOrigins,
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  }
}));

app.use(express.json());
app.use(pinoHttp({ logger }));

function responderOk(res, respuesta = {}, mensaje = '', codigo = 200) {
  return res.status(codigo).json({
    estado: 'OK',
    codigo,
    mensaje,
    respuesta
  });
}

function responderError(res, codigo, mensaje) {
  return res.status(codigo).json({
    estado: 'ERROR',
    codigo,
    mensaje,
    respuesta: {}
  });
}

function obtenerHeaderTexto(req, nombre) {
  const valor = req.headers[nombre];

  if (Array.isArray(valor)) {
    return String(valor[0] || '').trim();
  }

  return String(valor || '').trim();
}

function obtenerUsuarioId(req) {
  return obtenerHeaderTexto(req, 'x-usuario-id');
}

function textoObligatorio(valor) {
  return String(valor ?? '').trim();
}

async function obtenerConversacionActiva(convId, usuarioId) {
  const result = await pool.query(
    `SELECT *
     FROM CONVERSACION
     WHERE CONV_ID = $1
     AND CONV_ESTADO = 1
     AND (U_ID_DUENO = $2 OR U_ID_CONTACTO = $2)`,
    [convId, usuarioId]
  );

  return result.rows[0] || null;
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Debes iniciar sesion'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.data.usuario = {
      id: payload.sub,
      tipo: payload.tipo
    };
    return next();
  } catch {
    return next(new Error('Sesion invalida o expirada'));
  }
});

io.on('connection', (socket) => {
  socket.on('conversacion:unirse', async ({ convId }, callback) => {
    try {
      const usuarioId = socket.data.usuario?.id;
      const convIdTexto = textoObligatorio(convId);

      if (!convIdTexto || !usuarioId) {
        if (callback) {
          callback({ ok: false });
        }

        return;
      }

      const conversacion = await obtenerConversacionActiva(convIdTexto, usuarioId);

      if (!conversacion) {
        if (callback) {
          callback({ ok: false });
        }

        return;
      }

      socket.join(`conversacion:${convIdTexto}`);

      if (callback) {
        callback({ ok: true });
      }
    } catch {
      if (callback) {
        callback({ ok: false });
      }
    }
  });

  socket.on('conversacion:salir', ({ convId }) => {
    const convIdTexto = textoObligatorio(convId);

    if (convIdTexto) {
      socket.leave(`conversacion:${convIdTexto}`);
    }
  });
});

app.get('/health', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW() AS fecha');

    return responderOk(res, {
      servicio: 'mensajeria-service',
      fecha: result.rows[0].fecha
    }, 'Mensajeria service operativo');
  } catch (error) {
    return next(error);
  }
});

app.post('/conversaciones', async (req, res, next) => {
  try {
    const usuarioId = obtenerUsuarioId(req);
    const tipoReporte = textoObligatorio(req.body.tipoReporte).toUpperCase();
    const reporteId = textoObligatorio(req.body.reporteId);
    const uIdDueno = textoObligatorio(req.body.uIdDueno);
    const uIdContacto = textoObligatorio(req.body.uIdContacto);

    if (!usuarioId) {
      return responderError(res, 401, 'Debes iniciar sesion');
    }

    if (!tipoReporte || !reporteId || !uIdDueno || !uIdContacto) {
      return responderError(res, 400, 'Faltan datos obligatorios');
    }

    if (!['PERDIDA', 'HALLAZGO'].includes(tipoReporte)) {
      return responderError(res, 400, 'tipoReporte debe ser PERDIDA o HALLAZGO');
    }

    if (uIdDueno === uIdContacto) {
      return responderError(res, 400, 'Los usuarios de la conversacion deben ser distintos');
    }

    if (usuarioId !== uIdDueno && usuarioId !== uIdContacto) {
      return responderError(res, 403, 'No puedes crear una conversacion para otros usuarios');
    }

    const result = await pool.query(
      `INSERT INTO CONVERSACION (TIPO_REPORTE, REPORTE_ID, U_ID_DUENO, U_ID_CONTACTO)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ON CONSTRAINT uq_conversacion_participantes
       DO UPDATE SET CONV_ESTADO = CONVERSACION.CONV_ESTADO
       RETURNING *`,
      [tipoReporte, reporteId, uIdDueno, uIdContacto]
    );

    return responderOk(res, result.rows[0], 'Conversacion creada correctamente', 201);
  } catch (error) {
    return next(error);
  }
});

app.get('/conversaciones/usuario/:uId', async (req, res, next) => {
  try {
    const usuarioId = obtenerUsuarioId(req);
    const uId = textoObligatorio(req.params.uId);

    if (!usuarioId) {
      return responderError(res, 401, 'Debes iniciar sesion');
    }

    if (usuarioId !== uId) {
      return responderError(res, 403, 'No puedes consultar conversaciones de otro usuario');
    }

    const result = await pool.query(
      `SELECT
         c.*,
         m.MSG_CONTENIDO AS ultimo_mensaje,
         m.MSG_FECHA AS ultimo_mensaje_fecha,
         m.U_ID_EMISOR AS ultimo_mensaje_emisor,
         COALESCE(n.no_leidos, 0) AS mensajes_no_leidos
       FROM CONVERSACION c
       LEFT JOIN LATERAL (
         SELECT MSG_CONTENIDO, MSG_FECHA, U_ID_EMISOR
         FROM MENSAJE
         WHERE CONV_ID = c.CONV_ID
         AND MSG_ESTADO = 1
         ORDER BY MSG_FECHA DESC
         LIMIT 1
       ) m ON true
       LEFT JOIN (
         SELECT CONV_ID, COUNT(*) AS no_leidos
         FROM MENSAJE
         WHERE U_ID_RECEPTOR = $1
         AND MSG_LEIDO = 2
         AND MSG_ESTADO = 1
         GROUP BY CONV_ID
       ) n ON n.CONV_ID = c.CONV_ID
       WHERE c.CONV_ESTADO = 1
       AND (c.U_ID_DUENO = $1 OR c.U_ID_CONTACTO = $1)
       ORDER BY COALESCE(m.MSG_FECHA, c.CONV_FECHA) DESC`,
      [usuarioId]
    );

    return responderOk(res, result.rows, 'Conversaciones obtenidas correctamente');
  } catch (error) {
    return next(error);
  }
});

app.get('/conversaciones/:convId/mensajes', async (req, res, next) => {
  try {
    const usuarioId = obtenerUsuarioId(req);
    const convId = textoObligatorio(req.params.convId);

    if (!usuarioId) {
      return responderError(res, 401, 'Debes iniciar sesion');
    }

    const conversacion = await obtenerConversacionActiva(convId, usuarioId);

    if (!conversacion) {
      return responderError(res, 404, 'Conversacion no encontrada');
    }

    const result = await pool.query(
      `SELECT *
       FROM MENSAJE
       WHERE CONV_ID = $1
       AND MSG_ESTADO = 1
       ORDER BY MSG_FECHA ASC`,
      [convId]
    );

    return responderOk(res, result.rows, 'Mensajes obtenidos correctamente');
  } catch (error) {
    return next(error);
  }
});

app.post('/mensajes', async (req, res, next) => {
  try {
    const usuarioId = obtenerUsuarioId(req);
    const convId = textoObligatorio(req.body.convId);
    const uIdEmisor = textoObligatorio(req.body.uIdEmisor);
    const msgContenido = textoObligatorio(req.body.msgContenido);

    if (!usuarioId) {
      return responderError(res, 401, 'Debes iniciar sesion');
    }

    if (!convId || !msgContenido) {
      return responderError(res, 400, 'Faltan datos obligatorios');
    }

    if (uIdEmisor && uIdEmisor !== usuarioId) {
      return responderError(res, 403, 'No puedes enviar mensajes en nombre de otro usuario');
    }

    if (msgContenido.length > 1000) {
      return responderError(res, 400, 'El mensaje no puede superar 1000 caracteres');
    }

    const conversacion = await obtenerConversacionActiva(convId, usuarioId);

    if (!conversacion) {
      return responderError(res, 404, 'Conversacion no encontrada');
    }

    const uIdReceptor = usuarioId === conversacion.u_id_dueno
      ? conversacion.u_id_contacto
      : conversacion.u_id_dueno;

    const result = await pool.query(
      `INSERT INTO MENSAJE (CONV_ID, U_ID_EMISOR, U_ID_RECEPTOR, MSG_CONTENIDO)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [convId, usuarioId, uIdReceptor, msgContenido]
    );

    const mensaje = result.rows[0];

    io.to(`conversacion:${convId}`).emit('mensaje:nuevo', mensaje);

    const payloadNotificacion = {
      usuarioDestinoId: uIdReceptor,
      usuarioEmisorId: usuarioId,
      conversacionId: convId,
      mensajeId: mensaje.msg_id || mensaje.MSG_ID,
      contenido: msgContenido
    };

    logger.info({
      payloadNotificacion,
      notificacionesServiceUrl: process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3008',
      tieneInternalToken: !!process.env.INTERNAL_SERVICE_TOKEN
    }, 'Intentando notificar mensaje');

    notificacionesClient.notificarMensaje(payloadNotificacion)
      .then((respuesta) => {
        logger.info({
          respuesta,
          payloadNotificacion
        }, 'Mensaje notificado correctamente');
      })
      .catch((error) => {
      logger.warn({
        error: {
          nombre: error.name,
          mensaje: error.message
        },
        payloadNotificacion,
        notificacionesServiceUrl: process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3008',
        tieneInternalToken: !!process.env.INTERNAL_SERVICE_TOKEN
      }, 'No fue posible notificar el mensaje');
    });

    return responderOk(res, mensaje, 'Mensaje enviado correctamente', 201);
  } catch (error) {
    return next(error);
  }
});

app.put('/mensajes/:msgId/leido', async (req, res, next) => {
  try {
    const usuarioId = obtenerUsuarioId(req);
    const msgId = textoObligatorio(req.params.msgId);

    if (!usuarioId) {
      return responderError(res, 401, 'Debes iniciar sesion');
    }

    const result = await pool.query(
      `UPDATE MENSAJE AS m
       SET MSG_LEIDO = 1
       FROM CONVERSACION AS c
       WHERE m.CONV_ID = c.CONV_ID
       AND m.MSG_ID = $1
       AND m.U_ID_RECEPTOR = $2
       AND m.MSG_ESTADO = 1
       AND c.CONV_ESTADO = 1
       RETURNING m.*`,
      [msgId, usuarioId]
    );

    if (result.rows.length === 0) {
      return responderError(res, 404, 'Mensaje no encontrado');
    }

    return responderOk(res, result.rows[0], 'Mensaje marcado como leido');
  } catch (error) {
    return next(error);
  }
});

app.use((err, req, res, next) => {
  if (req.log) {
    req.log.error(err);
  } else {
    logger.error(err);
  }

  if (res.headersSent) {
    return next(err);
  }

  return responderError(res, 500, 'Error interno del servicio de mensajeria');
});

server.listen(port, () => {
  logger.info(`mensajeria-service escuchando en puerto ${port}`);
});
