const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const coincidenciasRoutes = require('./routes/coincidencias.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.COINCIDENCIAS_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Coincidencias service operativo',
    respuesta: {},
  });
});

app.use('/coincidencias', coincidenciasRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Coincidencias service corriendo en puerto ${PORT}`);
});