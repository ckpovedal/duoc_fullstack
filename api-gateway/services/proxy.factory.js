const { createProxyMiddleware } = require('http-proxy-middleware');

function crearProxyServicio({ target, pathRewrite }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error(error, req, res) {
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
