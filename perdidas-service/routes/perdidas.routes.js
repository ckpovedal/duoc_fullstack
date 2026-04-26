const express = require('express');
const router = express.Router();
const perdidasController = require('../controller/perdidas.controller');

router.post('/', perdidasController.crearPerdida);
router.get('/', perdidasController.listarPerdidas);
router.get('/:id', perdidasController.obtenerPerdidaPorId);
router.put('/:id', perdidasController.actualizarPerdida);
router.patch('/:id/estado', perdidasController.cambiarEstado);

module.exports = router;
