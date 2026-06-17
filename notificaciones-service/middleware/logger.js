const pino = require('pino');
const pinoHttp = require('pino-http');

function limpiarRuta(ruta) {
  return String(ruta || '').replace(/token=[^&]+/gi, 'token=[OCULTO]');
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

const requestLogger = pinoHttp({
  logger,
  customProps(req) {
    return {
      requestId: req.headers['x-request-id'],
      ruta: limpiarRuta(req.originalUrl),
    };
  },
});

module.exports = {
  logger,
  requestLogger,
  limpiarRuta,
};
