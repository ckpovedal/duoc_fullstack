const express = require('express');
const hallazgosController = require('../controller/hallazgos.controller');

const router = express.Router();

router.post('/', hallazgosController.crearHallazgo);
router.get('/', hallazgosController.listarHallazgos);
router.get('/:id', hallazgosController.obtenerHallazgoPorId);

module.exports = router;
