const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const notificacionesRoutes = require('./routes/notificaciones.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.NOTIFICACIONES_SERVICE_PORT || 3008;

app.use(cors());
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

app.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Notificaciones service corriendo en puerto ${PORT}`);
});
