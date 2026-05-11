const jwt = require('jsonwebtoken');

function responderError(res, codigo, mensaje) {
  return res.status(codigo).json({
    estado: 'ERROR',
    codigo,
    mensaje,
    respuesta: {},
  });
}

function autenticar(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return responderError(res, 401, 'Debes iniciar sesion');
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = {
      id: payload.sub,
      tipo: payload.tipo,
    };
    return next();
  } catch {
    return responderError(res, 401, 'Sesion invalida o expirada');
  }
}

function protegerUsuarios(req, res, next) {
  const ruta = String(req.path || '').split('?')[0];

  if (req.method === 'POST' && (ruta === '/' || ruta === '/login')) {
    return next();
  }

  return autenticar(req, res, () => {
    const idRuta = ruta.split('/').filter(Boolean)[0];

    if ((req.method === 'GET' || req.method === 'PUT') && idRuta && idRuta !== req.usuario.id) {
      return responderError(res, 403, 'No puedes acceder a otro perfil');
    }

    return next();
  });
}

function protegerEscrituraReportes(req, res, next) {
  if (req.method === 'GET') {
    return next();
  }

  return autenticar(req, res, () => {
    req.body = req.body || {};
    req.body.u_id = req.usuario.id;
    return next();
  });
}

module.exports = {
  autenticar,
  protegerUsuarios,
  protegerEscrituraReportes,
};
