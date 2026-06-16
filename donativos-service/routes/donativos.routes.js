const express = require('express');
const router = express.Router();
const donativosController = require('../controller/donativos.controller');

router.post('/', donativosController.crearDonativo);
router.get('/resumen', donativosController.obtenerResumen);
router.get('/mis-donativos', donativosController.listarMisDonativos);
router.get('/admin', donativosController.listarDonativosAdmin);
router.get('/admin/:id', donativosController.obtenerDonativoAdmin);

module.exports = router;
