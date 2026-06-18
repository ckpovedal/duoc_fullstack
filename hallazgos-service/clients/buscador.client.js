const AppError = require('../utils/AppError');

const BUSCADOR_SERVICE_URL = process.env.BUSCADOR_SERVICE_URL || 'http://localhost:3002';

class BuscadorClient {
  async buscarCoincidenciasPorHallazgo(hallazgoId) {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 10000);

    try {
      const response = await fetch(`${BUSCADOR_SERVICE_URL}/buscador/hallazgo/${encodeURIComponent(hallazgoId)}`, {
        signal: controlador.signal
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new AppError(json?.mensaje || 'No fue posible buscar coincidencias del hallazgo', response.status);
      }

      return json?.respuesta || json?.data || json;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        throw new AppError('buscador-service no respondio a tiempo', 504);
      }

      throw new AppError('No fue posible conectar con buscador-service', 502);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

module.exports = new BuscadorClient();
