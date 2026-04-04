const AppError = require('../utils/AppError');

const REPORTES_SERVICE_URL = process.env.REPORTES_SERVICE_URL || 'http://localhost:3000';

class ReportesClient {
  async obtenerReportePorId(id) {
    const response = await fetch(`${REPORTES_SERVICE_URL}/reportes/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new AppError('Reporte no encontrado', 404);
      }

      throw new AppError('Error al consultar reportes-service', 502);
    }

    const body = await response.json();
    return body.respuesta || body.data || body;
  }

  async listarReportes() {
    const response = await fetch(`${REPORTES_SERVICE_URL}/reportes`);

    if (!response.ok) {
      throw new AppError('Error al obtener reportes', 502);
    }

    const body = await response.json();
    return body.respuesta || body.data || [];
  }
}

module.exports = new ReportesClient();