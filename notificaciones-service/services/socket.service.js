const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

let io = null;

function inicializarSocket(server, allowedOrigins) {
  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: allowedOrigins.length === 0 ? true : allowedOrigins,
      methods: ['GET', 'POST']
    }
  });

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
    const usuarioId = socket.data.usuario?.id;

    if (usuarioId) {
      socket.join(`usuario:${usuarioId}`);
    }
  });

  return io;
}

function emitirNotificacionNueva(usuarioId, notificacion) {
  if (!io || !usuarioId) {
    return;
  }

  io.to(`usuario:${usuarioId}`).emit('notificacion:nueva', notificacion);
}

function emitirNotificacionLeida(usuarioId, notificacion) {
  if (!io || !usuarioId) {
    return;
  }

  io.to(`usuario:${usuarioId}`).emit('notificacion:leida', notificacion);
}

module.exports = {
  inicializarSocket,
  emitirNotificacionNueva,
  emitirNotificacionLeida
};
