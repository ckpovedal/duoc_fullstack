const AppError = require('../utils/AppError');

const PERDIDAS_SERVICE_URL = process.env.PERDIDAS_SERVICE_URL || 'http://localhost:3000';

class PerdidasClient {
  async obtenerPerdidaPorId(id) {
    try {
      const response = await fetch(`${PERDIDAS_SERVICE_URL}/perdidas/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new AppError('Perdida no encontrada', 404);
        }

        throw new AppError('Error al consultar perdidas-service', 502);
      }

      const body = await this.obtenerBody(response);
      return body.respuesta || body.data || body;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con perdidas-service', 502);
    }
  }

  async listarPerdidas() {
    try {
      const response = await fetch(`${PERDIDAS_SERVICE_URL}/perdidas`);

      if (!response.ok) {
        throw new AppError('Error al obtener perdidas', 502);
      }

      const body = await this.obtenerBody(response);
      return body.respuesta || body.data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con perdidas-service', 502);
    }
  }

  async obtenerBody(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new AppError('Respuesta invalida de perdidas-service', 502);
    }
  }
}

module.exports = new PerdidasClient();
