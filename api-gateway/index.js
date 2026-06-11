const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const http = require('http');
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rutas = require('./routes/api.routes');
const manejarErrores = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const server = http.createServer(app);
const puerto = process.env.API_GATEWAY_PORT || 3001;

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const mensajeriaSocketProxy = createProxyMiddleware({
  target: process.env.MENSAJERIA_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  ws: true,
  pathRewrite: (ruta) => {
    if (ruta.startsWith('/api/mensajeria/socket.io')) {
      return ruta.replace('/api/mensajeria/socket.io', '/socket.io');
    }

    if (ruta.startsWith('/socket.io')) {
      return ruta;
    }

    return `/socket.io${ruta === '/' ? '' : ruta}`;
  },
  on: {
    error(error, req, res) {
      logger.error({
        error: {
          nombre: error.name,
          mensaje: error.message
        }
      }, 'No fue posible conectar con el socket de mensajería');

      if (res?.headersSent) {
        return;
      }

      res?.status?.(503).json({
        estado: 'ERROR',
        codigo: 503,
        mensaje: 'No fue posible conectar con el socket de mensajería',
        respuesta: {},
      });
    }
  }
});

app.use(cors({
  origin: corsOrigins.length > 0 ? corsOrigins : true
}));

app.use('/api/mensajeria/socket.io', mensajeriaSocketProxy);

app.use(express.json({ limit: '70mb' }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'API Gateway operativo',
    respuesta: {},
  });
});

app.use('/api', rutas);

app.use(manejarErrores);

server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/api/mensajeria/socket.io')) {
    mensajeriaSocketProxy.upgrade(req, socket, head);
  }
});

server.listen(puerto, () => {
  logger.info({ puerto }, `API Gateway corriendo en puerto ${puerto}`);
});
