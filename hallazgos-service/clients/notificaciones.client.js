const AppError = require('../utils/AppError');

const NOTIFICACIONES_SERVICE_URL = process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3008';

class NotificacionesClient {
  async notificarCoincidencia(data) {
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!internalToken) {
      throw new AppError('No hay token interno configurado para notificaciones', 500);
    }

    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 10000);

    try {
      const response = await fetch(`${NOTIFICACIONES_SERVICE_URL}/notificaciones/eventos/coincidencia`, {
        method: 'POST',
        signal: controlador.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Token': internalToken
        },
        body: JSON.stringify(data)
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new AppError(json?.mensaje || 'No fue posible enviar la notificacion de coincidencia', response.status);
      }

      return json?.respuesta || json?.data || json;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new AppError('notificaciones-service no respondio a tiempo', 504);
      }

      throw new AppError('No fue posible conectar con notificaciones-service', 502);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

module.exports = new NotificacionesClient();
