const AppError = require('../utils/AppError');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const codigo = error instanceof AppError ? error.codigo : 500;
  const mensaje = error instanceof AppError ? error.message : 'Error interno del servicio de notificaciones';

  if (req.log) {
    req.log.error({
      error: {
        nombre: error.name,
        mensaje: error.message,
        stack: error.stack,
        codigo: error.code,
        detalle: error.detail,
        tabla: error.table,
        columna: error.column,
        restriccion: error.constraint
      }
    }, 'Error en notificaciones-service');
  }

  return res.status(codigo).json({
    estado: 'ERROR',
    codigo,
    mensaje,
    respuesta: {},
  });
}

module.exports = errorHandler;
