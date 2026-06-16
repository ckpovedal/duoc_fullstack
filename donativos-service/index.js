const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const donativosRoutes = require('./routes/donativos.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.DONATIVOS_SERVICE_PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Donativos service operativo',
    respuesta: {},
  });
});

app.use('/donativos', donativosRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Donativos service corriendo en puerto ${PORT}`);
});
