const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

console.log('DEBUG GAC:', process.env.GOOGLE_APPLICATION_CREDENTIALS); // <-- temporal

const http = require('http');
const express = require('express');
const cors = require('cors');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');
const socketService = require('./services/socket.service');

const app = express();
const server = http.createServer(app);
const PORT = process.env.NOTIFICACIONES_SERVICE_PORT || 3008;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

socketService.inicializarSocket(server, allowedOrigins);

app.use(cors({
  origin: allowedOrigins.length === 0 ? true : allowedOrigins
}));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Notificaciones service operativo',
    respuesta: {},
  });
});

app.use('/notificaciones', notificacionesRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Notificaciones service corriendo en puerto ${PORT}`);
});
