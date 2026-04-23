const express = require('express');
const coincidenciasController = require('../controller/coincidencias.controller');

const router = express.Router();

router.get('/:reporteId', coincidenciasController.obtenerCoincidencias);

module.exports = router;