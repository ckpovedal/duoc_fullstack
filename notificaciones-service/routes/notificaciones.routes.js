const express = require('express');
const notificacionesController = require('../controller/notificaciones.controller');

const router = express.Router();

router.post('/dispositivos', notificacionesController.registrarDispositivo);
router.patch('/dispositivos/desactivar', notificacionesController.desactivarDispositivo);
router.get('/', notificacionesController.listarNotificaciones);
router.patch('/:id/leida', notificacionesController.marcarLeida);
router.post('/enviar-prueba', notificacionesController.enviarPrueba);
router.post('/eventos/mensaje', notificacionesController.notificarMensaje);

module.exports = router;
