const reportesService = require('../services/reportes.service');
const RespuestaDTO = require('../dto/respuestaDTO');

class ReportesController {
  constructor() {
    this.crearReporte = this.crearReporte.bind(this);
    this.listarReportes = this.listarReportes.bind(this);
    this.obtenerReportePorId = this.obtenerReportePorId.bind(this);
    this.actualizarReporte = this.actualizarReporte.bind(this);
    this.cambiarEstado = this.cambiarEstado.bind(this);
    this.agregarFoto = this.agregarFoto.bind(this);
    this.agregarContacto = this.agregarContacto.bind(this);
    this.asignarReporte = this.asignarReporte.bind(this);
  }

  enviarRespuesta(res, data, mensaje, codigo = 200) {
    const respuesta = new RespuestaDTO().ok(data, mensaje, codigo);
    return res.status(codigo).json(respuesta);
  }

  async crearReporte(req, res, next) {
    try {
      const data = await reportesService.crearReporte(req.body);
      return this.enviarRespuesta(res, data, 'Reporte creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async listarReportes(req, res, next) {
    try {
      const data = await reportesService.listarReportes(req.query);
      return this.enviarRespuesta(res, data, 'Reportes obtenidos correctamente');
    } catch (error) {
      next(error);
    }
  }

  async obtenerReportePorId(req, res, next) {
    try {
      const data = await reportesService.obtenerReportePorId(req.params.id);
      return this.enviarRespuesta(res, data, 'Reporte obtenido correctamente');
    } catch (error) {
      next(error);
    }
  }

  async actualizarReporte(req, res, next) {
    try {
      const data = await reportesService.actualizarReporte(req.params.id, req.body);
      return this.enviarRespuesta(res, data, 'Reporte actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const data = await reportesService.cambiarEstado(req.params.id, req.body);
      return this.enviarRespuesta(res, data, 'Estado actualizado correctamente');
    } catch (error) {
      next(error);
    }
  }

  async agregarFoto(req, res, next) {
    try {
      const data = await reportesService.agregarFoto(req.params.id, req.body);
      return this.enviarRespuesta(res, data, 'Foto agregada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async agregarContacto(req, res, next) {
    try {
      const data = await reportesService.agregarContacto(req.params.id, req.body);
      return this.enviarRespuesta(res, data, 'Contacto agregado correctamente', 201);
    } catch (error) {
      next(error);
    }
  }

  async asignarReporte(req, res, next) {
    try {
      const data = await reportesService.asignarReporte(req.params.id, req.body);
      return this.enviarRespuesta(res, data, 'Asignación creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportesController();
