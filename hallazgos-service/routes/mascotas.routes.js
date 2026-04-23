const express = require('express');
const mascotasController = require('../controller/mascotas.controller');

const router = express.Router();

router.post('/', mascotasController.crearMascota);
router.get('/', mascotasController.listarMascotas);
router.get('/:id', mascotasController.obtenerMascotaPorId);

module.exports = router;