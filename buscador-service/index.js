const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const buscadorRoutes = require('./routes/buscador.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.BUSCADOR_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Buscador service operativo',
    respuesta: {},
  });
});

app.use('/buscador', buscadorRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Buscador service corriendo en puerto ${PORT}`);
});
