const express = require('express');
const { crearProxyServicio } = require('../services/proxy.factory');

const router = express.Router();

router.use(
  '/hallazgos',
  crearProxyServicio({
    target: process.env.HALLAZGOS_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: (path) => `/hallazgos${path}`,
  })
);

router.use(
  '/perdidas',
  crearProxyServicio({
    target: process.env.PERDIDAS_SERVICE_URL || 'http://localhost:3000',
    pathRewrite: (path) => `/perdidas${path}`,
  })
);

router.use(
  '/buscador',
  crearProxyServicio({
    target: process.env.BUSCADOR_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: (path) => `/buscador${path}`,
  })
);

module.exports = router;
