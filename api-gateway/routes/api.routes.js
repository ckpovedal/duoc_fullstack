const express = require('express');
const {
  autenticar,
  autenticarOpcional,
  protegerEscrituraReportes,
  protegerUsuarios,
  protegerAdminDonativos
} = require('../middleware/auth.middleware');
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

router.use(
  '/notificaciones',
  autenticar,
  crearProxyServicio({
    target: process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3008',
    pathRewrite: (path) => `/notificaciones${path}`,
  })
);

router.use(
  '/donativos/resumen',
  autenticar,
  protegerAdminDonativos,
  crearProxyServicio({
    target: process.env.DONATIVOS_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: (path) => `/donativos/resumen${path}`,
  })
);

router.use(
  '/donativos/admin',
  autenticar,
  protegerAdminDonativos,
  crearProxyServicio({
    target: process.env.DONATIVOS_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: (path) => `/donativos/admin${path}`,
  })
);

router.use(
  '/donativos/mis-donativos',
  autenticar,
  crearProxyServicio({
    target: process.env.DONATIVOS_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: (path) => `/donativos/mis-donativos${path}`,
  })
);

router.use(
  '/donativos',
  autenticarOpcional,
  crearProxyServicio({
    target: process.env.DONATIVOS_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: (path) => `/donativos${path}`,
  })
);

module.exports = router;
