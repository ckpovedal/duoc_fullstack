const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const hallazgosRoutes = require('./routes/hallazgos.routes');
const errorHandler = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./middleware/logger');

const app = express();
const PORT = process.env.HALLAZGOS_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json({ limit: '70mb' }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Hallazgos service operativo',
    respuesta: {},
  });
});

app.use('/hallazgos', hallazgosRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ puerto: PORT }, `Hallazgos service corriendo en puerto ${PORT}`);
});
