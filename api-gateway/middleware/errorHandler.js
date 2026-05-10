const { logger, limpiarRuta } = require('./logger');

function manejarErrores(error, req, res, next) {
  const codigo = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del API Gateway';

  if (res.headersSent) {
    return next(error);
  }

  const nivel = codigo >= 500 ? 'error' : 'warn';
  logger[nivel]({
    error: {
      nombre: error.name,
      mensaje: error.message,
      stack: (process.env.LOG_LEVEL || '').toLowerCase() === 'debug' ? error.stack : undefined
    },
    metodo: req.method,
    ruta: limpiarRuta(req.originalUrl),
    codigo
  }, mensaje);

  return res.status(codigo).json({
    estado: 'Error',
    codigo,
    mensaje,
    respuesta: {},
  });
}

module.exports = manejarErrores;
