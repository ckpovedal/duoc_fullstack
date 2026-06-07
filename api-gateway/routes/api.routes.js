const express = require('express');
const { autenticar, protegerEscrituraReportes, protegerUsuarios } = require('../middleware/auth.middleware');
const { crearProxyServicio } = require('../services/proxy.factory');

const router = express.Router();

router.use(
  '/usuarios',
  protegerUsuarios,
  crearProxyServicio({
    target: process.env.USUARIO_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: (path) => (path === '/' ? '/usuarios' : `/usuarios${path}`),
  })
);

router.use(
  '/hallazgos',
  protegerEscrituraReportes,
  crearProxyServicio({
    target: process.env.HALLAZGOS_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: (path) => `/hallazgos${path}`,
  })
);

router.use(
  '/perdidas',
  protegerEscrituraReportes,
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

router.use(
  '/geolocalizacion',
  protegerEscrituraReportes,
  crearProxyServicio({
    target: process.env.GEOLOCALIZACION_SERVICE_URL || 'http://localhost:3005',
    pathRewrite: (path) => `/geolocalizacion${path}`,
  })
);

router.use(
  '/mensajeria',
  autenticar,
  crearProxyServicio({
    target: process.env.MENSAJERIA_SERVICE_URL || 'http://localhost:3006',
    pathRewrite: (path) => path,
  })
);

module.exports = router;
