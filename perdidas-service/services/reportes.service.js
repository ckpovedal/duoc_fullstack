const reportesRepository = require('../repository/reportes.repository');
const AppError = require('../utils/AppError');

class ReportesService {
	validarCoordenadas(latitud, longitud) {
		const latVacia = latitud === undefined || latitud === null;
		const lngVacia = longitud === undefined || longitud === null;

		if ((latVacia && !lngVacia) || (!latVacia && lngVacia)) {
			throw new AppError('Latitud y longitud deben enviarse juntas', 400);
		}

		if (!latVacia && (latitud < -90 || latitud > 90)) {
			throw new AppError('Latitud fuera de rango', 400);
		}

		if (!lngVacia && (longitud < -180 || longitud > 180)) {
			throw new AppError('Longitud fuera de rango', 400);
		}
	}

	validarRecompensa(recompensa) {
		if (recompensa !== undefined && recompensa !== null && recompensa < 0) {
			throw new AppError('La recompensa no puede ser negativa', 400);
		}
	}

	validarCambioEstado(estadoActual, nuevoEstado) {
		const transicionesPermitidas = {
			ABIERTO: ['EN_REVISION', 'COINCIDENCIA', 'CANCELADO'],
			EN_REVISION: ['COINCIDENCIA', 'RESUELTO', 'CANCELADO'],
			COINCIDENCIA: ['RESUELTO', 'CERRADO', 'CANCELADO'],
			RESUELTO: ['CERRADO'],
			CERRADO: [],
			CANCELADO: [],
		};

		const permitidos = transicionesPermitidas[estadoActual] || [];
		if (!permitidos.includes(nuevoEstado)) {
			throw new AppError(
				`No se puede cambiar de ${estadoActual} a ${nuevoEstado}`,
				400
			);
		}
	}

	async crearReporte(data) {
		if (!data.mascota_id) {
			throw new AppError('mascota_id es obligatorio', 400);
		}

		if (!data.tipo) {
			throw new AppError('tipo es obligatorio', 400);
		}

		const mascotaExiste = await reportesRepository.existeMascota(data.mascota_id);
		if (!mascotaExiste) {
			throw new AppError('La mascota indicada no existe', 404);
		}

		if (data.usuario_reporta_id) {
			const usuarioExiste = await reportesRepository.existeUsuario(data.usuario_reporta_id);
			if (!usuarioExiste) {
				throw new AppError('El usuario que reporta no existe', 404);
			}
		}

		if (data.organizacion_id) {
			const organizacionExiste = await reportesRepository.existeOrganizacion(data.organizacion_id);
			if (!organizacionExiste) {
				throw new AppError('La organización no existe', 404);
			}
		}

		this.validarCoordenadas(data.latitud, data.longitud);
		this.validarRecompensa(data.recompensa);

		const reporte = await reportesRepository.crearReporte(data);

		await reportesRepository.crearHistorialEstado({
			reporte_id: reporte.id,
			estado_anterior: null,
			estado_nuevo: reporte.estado,
			cambiado_por_usuario_id: data.usuario_reporta_id || null,
			comentario: 'Creación inicial del reporte',
		});
		
		return reporte;
	}

	async listarReportes(filtros) {
		return await reportesRepository.listarReportes(filtros);
	}

	async obtenerReportePorId(id) {
		const reporte = await reportesRepository.obtenerReportePorId(id);

		if (!reporte) {
			throw new AppError('Reporte no encontrado', 404);
		}

		const [fotos, contactos, historial, asignaciones] = await Promise.all([
			reportesRepository.obtenerFotosPorReporte(id),
			reportesRepository.obtenerContactosPorReporte(id),
			reportesRepository.obtenerHistorialPorReporte(id),
			reportesRepository.obtenerAsignacionesPorReporte(id),
		]);

		return {
			...reporte,
			fotos,
			contactos,
			historial,
			asignaciones
		};
	}

	async actualizarReporte(id, data) {
		const reporteActual = await reportesRepository.obtenerReportePorId(id);

		if (!reporteActual) {
			throw new AppError('Reporte no encontrado', 404);
		}

		this.validarCoordenadas(data.latitud, data.longitud);
		this.validarRecompensa(data.recompensa);

		const actualizado = await reportesRepository.actualizarReporte(id, {
			...reporteActual,
			...data,
		});

		return actualizado;
	}

	async cambiarEstado(id, data) {
		const { nuevoEstado, usuarioId, comentario } = data;

		if (!nuevoEstado) {
			throw new AppError('nuevoEstado es obligatorio', 400);
		}

		const reporte = await reportesRepository.obtenerReportePorId(id);
		if (!reporte) {
			throw new AppError('Reporte no encontrado', 404);
		}

		this.validarCambioEstado(reporte.estado, nuevoEstado);

		const actualizado = await reportesRepository.cambiarEstadoReporte(id, nuevoEstado);

		await reportesRepository.crearHistorialEstado({
			reporte_id: id,
			estado_anterior: reporte.estado,
			estado_nuevo: nuevoEstado,
			cambiado_por_usuario_id: usuarioId || null,
			comentario: comentario || null,
		});

		return actualizado;
	}

	async agregarFoto(reporteId, data) {
		const reporte = await reportesRepository.obtenerReportePorId(reporteId);
		if (!reporte) {
			throw new AppError('Reporte no encontrado', 404);
		}

		if (!data.url_archivo) {
			throw new AppError('url_archivo es obligatorio', 400);
		}

		return await reportesRepository.agregarFoto({
			reporte_id: reporteId,
			...data,
		});
	}

	async agregarContacto(reporteId, data) {
		const reporte = await reportesRepository.obtenerReportePorId(reporteId);
		if (!reporte) {
			throw new AppError('Reporte no encontrado', 404);
		}

		if (!data.nombre) {
			throw new AppError('nombre es obligatorio', 400);
		}

		return await reportesRepository.agregarContacto({
			reporte_id: reporteId,
			...data,
		});
	}

	async asignarReporte(reporteId, data) {
		const reporte = await reportesRepository.obtenerReportePorId(reporteId);
		if (!reporte) {
			throw new AppError('Reporte no encontrado', 404);
		}

		if (!data.tipo_asignacion) {
			throw new AppError('tipo_asignacion es obligatorio', 400);
		}

		if (!data.usuario_asignado_id && !data.organizacion_asignada_id) {
			throw new AppError(
				'Debe existir usuario_asignado_id o organizacion_asignada_id', 400
			);
		}

		if (data.usuario_asignado_id) {
			const usuarioExiste = await reportesRepository.existeUsuario(data.usuario_asignado_id);
			if (!usuarioExiste) {
				throw new AppError('El usuario asignado no existe', 404);
			}
		}

		if (data.organizacion_asignada_id) {
			const orgExiste = await reportesRepository.existeOrganizacion(data.organizacion_asignada_id);
			if (!orgExiste) {
				throw new AppError('La organización asignada no existe', 404);
			}
		}

		return await reportesRepository.crearAsignacion({
			reporte_id: reporteId,
			...data,
		});
	}
}

module.exports = new ReportesService();
