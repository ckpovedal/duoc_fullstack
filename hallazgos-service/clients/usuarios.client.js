const AppError = require('../utils/AppError');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3004';

class UsuariosClient {
  async existeUsuario(usuarioId) {
    try {
      const response = await fetch(`${USUARIO_SERVICE_URL}/usuarios/${encodeURIComponent(usuarioId)}`);

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        throw new AppError('Error al consultar usuario-service', 502);
      }

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con usuario-service', 502);
    }
  }
}

module.exports = new UsuariosClient();
