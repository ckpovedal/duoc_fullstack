const express = require('express');
const buscadorController = require('../controller/buscador.controller');

const router = express.Router();

router.get('/:perdidaId', buscadorController.obtenerCoincidencias);

module.exports = router;
