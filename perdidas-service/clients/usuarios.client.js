const AppError = require('../utils/AppError');

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || 'http://localhost:3004';

class UsuariosClient {
  async existeUsuario(usuarioId) {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 8000);

    try {
      const response = await fetch(`${USUARIO_SERVICE_URL}/usuarios/${encodeURIComponent(usuarioId)}`, {
        signal: controlador.signal,
      });

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

      if (error.name === 'AbortError') {
        throw new AppError('usuario-service no respondio a tiempo', 504);
      }

      throw new AppError('No fue posible conectar con usuario-service', 502);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

module.exports = new UsuariosClient();
