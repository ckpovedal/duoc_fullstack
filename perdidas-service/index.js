const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const perdidasRoutes = require('./routes/perdidas.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PERDIDAS_SERVICE_PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '70mb' }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Perdidas service operativo',
    respuesta: {},
  });
});

app.use('/perdidas', perdidasRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Perdidas service corriendo en puerto ${PORT}`);
});
