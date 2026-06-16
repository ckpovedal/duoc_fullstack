const jwt = require('jsonwebtoken');

function responderError(res, codigo, mensaje) {
  return res.status(codigo).json({
    estado: 'ERROR',
    codigo,
    mensaje,
    respuesta: {},
  });
}

function obtenerToken(req) {
  const authorization = req.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function asignarUsuario(req, token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  req.usuario = {
    id: payload.sub,
    tipo: payload.tipo,
  };
}

function autenticar(req, res, next) {
  const token = obtenerToken(req);

  if (!token) {
    return responderError(res, 401, 'Debes iniciar sesion');
  }

  try {
    asignarUsuario(req, token);
    return next();
  } catch {
    return responderError(res, 401, 'Sesion invalida o expirada');
  }
}

function autenticarOpcional(req, res, next) {
  const authorization = req.headers.authorization || '';

  if (!authorization) {
    return next();
  }

  const token = obtenerToken(req);

  if (!token) {
    return responderError(res, 401, 'Sesion invalida o expirada');
  }

  try {
    asignarUsuario(req, token);
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

  if (req.method === 'GET' && ruta.startsWith('/contactos/')) {
    return autenticar(req, res, next);
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

function protegerAdminDonativos(req, res, next) {
  const administradores = String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (!administradores.length) {
    return responderError(res, 403, 'No hay administradores configurados');
  }

  if (!req.usuario?.id || !administradores.includes(req.usuario.id)) {
    return responderError(res, 403, 'No tienes permisos para acceder a donativos');
  }

  req.adminAutorizado = true;
  return next();
}

module.exports = {
  autenticar,
  autenticarOpcional,
  protegerUsuarios,
  protegerEscrituraReportes,
  protegerAdminDonativos,
};
