function manejarErrores(error, req, res, next) {
  const codigo = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del API Gateway';

  if (res.headersSent) {
    return next(error);
  }

  return res.status(codigo).json({
    estado: 'Error',
    codigo,
    mensaje,
    respuesta: {},
  });
}

module.exports = manejarErrores;
