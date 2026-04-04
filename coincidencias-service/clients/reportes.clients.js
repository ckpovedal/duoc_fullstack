const AppError = require('../utils/AppError');

const REPORTES_SERVICE_URL = process.env.REPORTES_SERVICE_URL || 'http://localhost:3000';

class ReportesClient {
  async obtenerReportePorId(id) {
    try {
      const response = await fetch(`${REPORTES_SERVICE_URL}/reportes/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new AppError('Reporte no encontrado', 404);
        }

        throw new AppError('Error al consultar reportes-service', 502);
      }

      const body = await this.obtenerBody(response);
      return body.respuesta || body.data || body;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con reportes-service', 502);
    }
  }

  async listarReportes() {
    try {
      const response = await fetch(`${REPORTES_SERVICE_URL}/reportes`);

      if (!response.ok) {
        throw new AppError('Error al obtener reportes', 502);
      }

      const body = await this.obtenerBody(response);
      return body.respuesta || body.data || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('No fue posible conectar con reportes-service', 502);
    }
  }

  async obtenerBody(response) {
    try {
      return await response.json();
    } catch (error) {
      throw new AppError('Respuesta invalida de reportes-service', 502);
    }
  }
}

module.exports = new ReportesClient();
