const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const geolocalizacionRoutes = require('./routes/geolocalizacion.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.GEOLOCALIZACION_SERVICE_PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Geolocalizacion service operativo',
    respuesta: {},
  });
});

app.use('/geolocalizacion', geolocalizacionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Geolocalizacion service corriendo en puerto ${PORT}`);
});
