const RespuestaDTO = require('../dto/respuestaDTO');

function errorHandler(error, req, res, next) {
  const codigo = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';

  if (res.headersSent) {
    return next(error);
  }

  const respuesta = new RespuestaDTO().error(codigo, mensaje);
  return res.status(codigo).json(respuesta);
}

module.exports = errorHandler;
