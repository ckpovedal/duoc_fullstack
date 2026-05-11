const AppError = require('../utils/AppError');

const HALLAZGOS_SERVICE_URL = process.env.HALLAZGOS_SERVICE_URL || 'http://localhost:3003';

class HallazgosClient {
  async listarHallazgos() {
    try {
      const response = await fetch(`${HALLAZGOS_SERVICE_URL}/hallazgos`);

      if (!response.ok) {
        throw new AppError('Error al obtener hallazgos', 502);
      }

      const body = await this.obtenerBody(response);
      const hallazgos = body.respuesta || body.data || body;

      if (Array.isArray(hallazgos)) {
        return hallazgos;
      }

      return hallazgos.items || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con hallazgos-service', 502);
    }
  }

  async obtenerBody(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new AppError('Respuesta invalida de hallazgos-service', 502);
    }
  }
}

module.exports = new HallazgosClient();
