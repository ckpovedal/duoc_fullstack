const express = require('express');
const router = express.Router();
const geolocalizacionController = require('../controller/geolocalizacion.controller');

router.get('/geocodificar', geolocalizacionController.geocodificar);
router.post('/geocodificar', geolocalizacionController.geocodificar);
router.get('/reverso', geolocalizacionController.geocodificarInversa);
router.post('/reverso', geolocalizacionController.geocodificarInversa);

router.post('/ubicaciones', geolocalizacionController.guardarUbicacion);
router.get('/ubicaciones', geolocalizacionController.listarUbicaciones);
router.get('/ubicaciones/:id', geolocalizacionController.obtenerUbicacionPorId);
router.put('/ubicaciones/:id', geolocalizacionController.actualizarUbicacion);
router.patch('/ubicaciones/:id/estado', geolocalizacionController.cambiarEstadoUbicacion);
router.get('/reportes/:tipoReporte/:reporteId', geolocalizacionController.obtenerUbicacionPorReporte);

router.post('/zonas', geolocalizacionController.crearZonaInteres);
router.get('/zonas', geolocalizacionController.listarZonasInteres);
router.get('/zonas/:id', geolocalizacionController.obtenerZonaInteresPorId);
router.put('/zonas/:id', geolocalizacionController.actualizarZonaInteres);
router.patch('/zonas/:id/estado', geolocalizacionController.cambiarEstadoZonaInteres);

module.exports = router;
