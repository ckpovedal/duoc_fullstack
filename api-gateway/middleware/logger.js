const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const pino = require('pino');
const pinoHttp = require('pino-http');

const serviceName = 'api-gateway';
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const logFile = process.env.LOG_FILE || path.resolve(__dirname, '../../logs/api-gateway.log');
const streams = [{ stream: process.stdout }];

if (logFile !== 'false') {
  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  streams.push({ stream: pino.destination({ dest: logFile, sync: false }) });
}

const logger = pino({
  level: logLevel,
  base: { service: serviceName },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.clave',
      'body.token',
      'body.p_imagen',
      'body.h_imagen',
      'body.imagen'
    ],
    censor: '[OCULTO]'
  },
  formatters: {
    level(label) {
      return { level: label };
    }
  }
}, pino.multistream(streams));

const requestLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const headerId = req.headers['x-request-id'];
    const id = Array.isArray(headerId) ? headerId[0] : headerId || randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        metodo: req.method,
        ruta: limpiarRuta(req.url)
      };
    },
    res(res) {
      return {
        estado: res.statusCode
      };
    }
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${limpiarRuta(req.url)} ${res.statusCode}`;
  },
  customErrorMessage(req, res, error) {
    return `${req.method} ${limpiarRuta(req.url)} ${res.statusCode} ${error.message}`;
  }
});

function limpiarRuta(ruta) {
  return String(ruta || '').split('?')[0];
}

module.exports = {
  logger,
  requestLogger,
  limpiarRuta
};
