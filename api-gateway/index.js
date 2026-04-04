const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const rutas = require('./routes/api.routes');
const manejarErrores = require('./middleware/errorHandler');

const app = express();
const puerto = process.env.API_GATEWAY_PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.listen(puerto, () => {
  console.log(`API Gateway corriendo en puerto ${puerto}`);
});
