const { createProxyMiddleware } = require('http-proxy-middleware');
const { logger, limpiarRuta } = require('../middleware/logger');

function crearProxyServicio({ target, pathRewrite }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq(proxyReq, req) {
        if (req.id) {
          proxyReq.setHeader('X-Request-Id', req.id);
        }

        if (!req.body || !Object.keys(req.body).length) {
          return;
        }

        const bodyData = JSON.stringify(req.body);

        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      },
      error(error, req, res) {
        logger.error({
          error: {
            nombre: error.name,
            mensaje: error.message
          },
          target,
          metodo: req.method,
          ruta: limpiarRuta(req.originalUrl)
        }, 'No fue posible conectar con el servicio');

        if (res.headersSent) {
          return;
        }

        res.status(503).json({
          estado: 'ERROR',
          codigo: 503,
          mensaje: `No fue posible conectar con el servicio ${target}`,
          respuesta: {},
        });
      },
    },
  });
}

module.exports = {
  crearProxyServicio,
};
