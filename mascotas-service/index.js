const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const express = require('express');
const cors = require('cors');
const mascotasRoutes = require('./routes/mascotas.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.MASCOTAS_SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Mascotas service operativo',
    respuesta: {},
  });
});

app.use('/mascotas', mascotasRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mascotas service corriendo en puerto ${PORT}`);
});
