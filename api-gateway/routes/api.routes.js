const express = require('express');
const { crearProxyServicio } = require('../services/proxy.factory');

const router = express.Router();

router.use(
  '/mascotas',
  crearProxyServicio({
    target: process.env.MASCOTAS_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: (path) => `/mascotas${path}`,
  })
);

router.use(
  '/reportes',
  crearProxyServicio({
    target: process.env.REPORTES_SERVICE_URL || 'http://localhost:3000',
    pathRewrite: (path) => `/reportes${path}`,
  })
);

router.use(
  '/coincidencias',
  crearProxyServicio({
    target: process.env.COINCIDENCIAS_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: (path) => `/coincidencias${path}`,
  })
);

module.exports = router;
