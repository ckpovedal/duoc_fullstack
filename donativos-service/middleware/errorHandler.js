const RespuestaDTO = require('../dto/respuestaDTO');
const { logger, limpiarRuta } = require('./logger');

function errorHandler(error, req, res, next) {
  const codigo = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';

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

  const respuesta = new RespuestaDTO().error(codigo, mensaje);
  return res.status(codigo).json(respuesta);
}

module.exports = errorHandler;
