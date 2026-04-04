const reportesService = require('../service/reportes.service');

class ReportesController {
  async CrearReporte(req, res, next) {
    try {
      const data = await reportesService.crearReporte(req.body);
      res.status(201).json({
        ok: true,
        message: 'Reporte creado correctamente',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  
}