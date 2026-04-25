const reportesClient = require('../clients/reportes.clients');
const AppError = require('../utils/AppError');

class BuscadorService {
  async buscarCoincidencias(reporteId) {
    const reporteBase = await reportesClient.obtenerReportePorId(reporteId);

    if (!reporteBase) {
      throw new AppError('Reporte no encontrado', 404);
    }

    const reportes = await reportesClient.listarReportes();

    const coincidencias = reportes
      .filter((reporte) => reporte.id !== reporteBase.id)
      .map((reporte) => this.construirCoincidencia(reporteBase, reporte))
      .filter((item) => item.puntaje > 0)
      .sort((a, b) => b.puntaje - a.puntaje);

    return {
      reporteBase,
      total: coincidencias.length,
      coincidencias,
    };
  }

  construirCoincidencia(reporteBase, reporteComparado) {
    const criterios = [];
    let puntaje = 0;

    const puntajeTipo = this.obtenerPuntajeTipo(reporteBase.tipo, reporteComparado.tipo);

    if (puntajeTipo > 0) {
      puntaje += puntajeTipo;
      criterios.push('tipo compatible');
    }

    if (reporteBase.comuna && reporteBase.comuna === reporteComparado.comuna) {
      puntaje += 25;
      criterios.push('misma comuna');
    }

    if (reporteBase.ciudad && reporteBase.ciudad === reporteComparado.ciudad) {
      puntaje += 15;
      criterios.push('misma ciudad');
    }

    if (reporteBase.region && reporteBase.region === reporteComparado.region) {
      puntaje += 10;
      criterios.push('misma region');
    }

    if (this.fechasCercanas(reporteBase.fecha_evento, reporteComparado.fecha_evento)) {
      puntaje += 10;
      criterios.push('fecha cercana');
    }

    return {
      reporte: reporteComparado,
      puntaje,
      nivel: this.obtenerNivel(puntaje),
      criterios,
    };
  }

  fechasCercanas(fecha1, fecha2) {
    if (!fecha1 || !fecha2) {
      return false;
    }

    const a = new Date(fecha1).getTime();
    const b = new Date(fecha2).getTime();
    const diferenciaDias = Math.abs(a - b) / (1000 * 60 * 60 * 24);

    return diferenciaDias <= 7;
  }

  obtenerPuntajeTipo(tipoBase, tipoComparado) {
    const combinaciones = {
      PERDIDA: {
        ENCONTRADA: 20,
        AVISTAMIENTO: 10,
      },
      ENCONTRADA: {
        PERDIDA: 20,
        AVISTAMIENTO: 5,
      },
      AVISTAMIENTO: {
        PERDIDA: 10,
        ENCONTRADA: 5,
      },
    };

    return combinaciones[tipoBase]?.[tipoComparado] || 0;
  }

  obtenerNivel(puntaje) {
    if (puntaje >= 50) {
      return 'ALTA';
    }

    if (puntaje >= 25) {
      return 'MEDIA';
    }

    return 'BAJA';
  }
}

module.exports = new BuscadorService();
