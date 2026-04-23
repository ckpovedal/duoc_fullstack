const express = require('express');
const router = express.Router();
const reportesController = require('../controller/reportes.controller');

router.post('/', reportesController.crearReporte);
router.get('/', reportesController.listarReportes);
router.get('/:id', reportesController.obtenerReportePorId);
router.put('/:id', reportesController.actualizarReporte);

router.patch('/:id/estado', reportesController.cambiarEstado);
router.post('/:id/fotos', reportesController.agregarFoto);
router.post('/:id/contactos', reportesController.agregarContacto);
router.post('/:id/asignaciones', reportesController.asignarReporte);

module.exports = router;