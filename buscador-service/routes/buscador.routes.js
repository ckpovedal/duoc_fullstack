const express = require('express');
const buscadorController = require('../controller/buscador.controller');

const router = express.Router();

router.get('/:reporteId', buscadorController.obtenerCoincidencias);

module.exports = router;