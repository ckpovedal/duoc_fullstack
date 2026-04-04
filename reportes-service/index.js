require('dotenv').config();

const express = require('express');
const cors = require('cors');
const reportesRoutes = require('./routes/reportes.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.REPORTES_SERVICE_PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    estado: 'OK',
    codigo: 200,
    mensaje: 'Reportes service operativo',
    respuesta: {},
  });
});

app.use('/reportes', reportesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Reportes service corriendo en puerto ${PORT}`);
});
