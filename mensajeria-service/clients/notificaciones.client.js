const NOTIFICACIONES_SERVICE_URL = process.env.NOTIFICACIONES_SERVICE_URL || 'http://localhost:3008';

class NotificacionesClient {
  async notificarMensaje(data) {
    const internalToken = process.env.INTERNAL_SERVICE_TOKEN;

    if (!internalToken) {
      throw new Error('No hay token interno configurado para notificaciones');
    }

    const response = await fetch(`${NOTIFICACIONES_SERVICE_URL}/notificaciones/eventos/mensaje`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': internalToken
      },
      body: JSON.stringify(data)
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(json?.mensaje || 'No fue posible enviar la notificacion de mensaje');
    }

    return json?.respuesta || json?.data || json;
  }
}

module.exports = new NotificacionesClient();
