const pool = require('../config/pg_db')

class ReportesRepository {
	async existeMascota(mascotaId) {
		const query = `SELECT id FROM mascotas WHERE id = $1`;
		const result = await pool.query(query, [mascotaId]);
		return result.rows.length > 0; 
	}

	async existeUsuario(UsuarioId) {
		const query = `SELECT id FROM usuarios WHERE id = $1`;
		const result = await pool.query(query, [UsuarioId]);
		return result.rows.length > 0;
	}

	async existeOrganizacion(organizacionId) {
		const query = `SELECT id FROM organizaciones WHERE id = $1`;
		const result = await pool.query(query, [organizacionId]);
		return result.rows.length > 0;
	}

	async crearReporte(data) {
		const query = `
		INSERT INTO reportes (
			mascota_id,
			usuario_reporta_id,
			organizacion_id,
			tipo,
			estado,
			titulo,
			descripcion,
			fecha_evento,
			fecha_ultima_vez,
			direccion,
			comuna,
			ciudad,
			region,
			latitud,
			longitud,
			recompensa,
			nombre_contacto,
			telefono_contacto,
			email_contacto,
			es_publico
		)
		VALUES (
			$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
			$11,$12,$13,$14,$15,$16,$17,$18,$19,$20
		)
		RETURNING *;
		`;

		const values = [
			data.mascota_id,
			data.usuario_reporta_id || null,
			data.organizacion_id || null,
			data.tipo,
			data.estado || 'ABIERTO',
			data.titulo || null,
			data.descripcion || null,
			data.fecha_evento || null,
			data.fecha_ultima_vez || null,
			data.direccion || null,
			data.comuna || null,
			data.ciudad || null,
			data.region || null,
			data.latitud || null,
			data.longitud || null,
			data.recompensa || null,
			data.nombre_contacto || null,
			data.telefono_contacto || null,
			data.email_contacto || null,
			data.es_publico ?? true,
		];

		const result = await pool.query(query, values);
		return result.rows[0];
	}

	async listarReportes(filtros = {}) {
		let query = `
			SELECT *
			FROM reportes
			WHERE 1=1
		`;

		const values = [];
		let idx = 1;

		if (filtros.tipo) {
			query += ` AND TIPO = $${idx++}`;
			values.push(filtros.tipo);
		}

		if (filtros.estado) {
			query += ` AND estado = $${idx++}`;
			values.push(filtros.estado);
		}

		if (filtros.comuna) {
			query += ` AND comuna ILIKE $${idx++}`;
			values.push(`%${filtros.comuna}%`);
		}

		if (filtros.ciudad) {
			query += ` AND ciudad ILIKE $${idx++}`;
			values.push(`%${filtros.ciudad}%`);
		}

		if (filtros.region) {
			query += ` AND region ILIKE $${idx++}`;
			values.push(`%${filtros.region}%`);
		}

		query += ` ORDER BY fecha_reporte DESC`;

		const result = await pool.query(query, values);
		return result.rows;
	}

	async obtenerReportePorId(id) {
		const query = `SELECT * FROM reportes WHERE id = $1`;
		const result = await pool.query(query, [id]);
		return result.rows[0] || null;
	}

	async actualizarReporte(id, data) {
		const query = `
			UPDATE reportes
			SET
				titulo = $2,
				descripcion = $3,
				fecha_evento = $4,
				fecha_ultima_vez = $5,
				direccion = $6,
				comuna = $7,
				ciudad = $8,
				region = $9,
				latitud = $10,
				longitud = $11,
				recompensa = $12,
				nombre_contacto = $13,
				telefono_contacto = $14,
				email_contacto = $15,
				es_publico = $16
			WHERE id = $1
			RETURNING *;
		`;

		const values = [
			id,
			data.titulo || null,
			data.descripcion || null,
			data.fecha_evento || null,
			data.fecha_ultima_vez || null,
			data.direccion || null,
			data.comuna || null,
			data.ciudad || null,
			data.region || null,
			data.latitud || null,
			data.longitud || null,
			data.recompensa || null,
			data.nombre_contacto || null,
			data.telefono_contacto || null,
			data.email_contacto || null,
			data.es_publico ?? true,
		];

		const result = await pool.query(query, values);
		return result.rows[0] || null;
	}

	async cambiarEstadoReporte(id, nuevoEstado) {
		const query = `
			UPDATE reportes
			SET estado = $2
			WHERE id = $1
			RETURNING *;
		`;
		const result = await pool.query(query, [id, nuevoEstado]);
		return result.rows[0] || null;
	}

	async crearHistorialEstado(data) {
		const query = `
			INSERT INTO historial_estado_reporte (
				reporte_id,
				estado_anterior,
				estado_nuevo,
				cambiado_por_usuario_id,
				comentario
			)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING *;
		`;

		const values = [
			data.reporte_id,
			data.estado_anterior || null,
			data.estado_nuevo,
			data.cambiado_por_usuario_id || null,
			data.comentario || null,
		];

		const result = await pool.query(query, values);
		return result.rows[0];
	}

	async obtenerHistorialPorReporte(reporteId) {
		const query = `
			SELECT *
			FROM historial_estado_reporte
			WHERE reporte_id = $1
			ORDER BY cambiado_en DESC
		`;
		const result = await pool.query(query, [reporteId]);
	}

	async agregarfoto(data) {
		const query = `
			INSERT INTO fotos_reporte (
				reporte_id,
				url_archivo,
				nombre_archivo,
				tipo_contenido,
				orden
			)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING *;
		`;

		const values = [
			data.reporte_id,
			data.url_archivo,
			data.nombre_archivo || null,
			data.tipo_contenido || null,
			data.orden || 0,
		];

		const result = await pool.query(query, values);
		return result.rows[0];
	}

	async obtenerFotosPorReporte(reporteId) {
		const query = `
			SELECT *
			FROM fotos_reporte
			WHERE reporte_id = $1
			ORDER BY orden ASC, subido_en ASC
		`;
		const result = await pool.query(query, [reporteId]);
		return result.rows;
	}

	async agregarContacto(data) {
		const query = `
			INSERT INTO contactos_reporte (
				reporte_id,
				nombre,
				telefono,
				email,
				tipo_relacion,
				es_principal
			)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *;
		`;

		const values = [
			data.reporte_id,
			data.nombre,
			data.telefono || null,
			data.email || null,
			data.tipo_relacion || 'OTRO',
			data.es_principal ?? false,
		];

		const result = await pool.query(query, values);
		return result.rows[0];
	}

	async obtenerContactosPorReporte(reporteId) {
		const query = `
			SELECT *
			FROM contactos_reporte
			WHERE reporte_id = $1
			ORDER BY es_principal DESC, creado_en ASC
		`;
		const result = await pool.query(query, [reporteId]);
		return result.rows;
	}

	async crearAsignacion(data) {
		const query = `
			INSERT INTO asignaciones_reporte (
				reporte_id,
				usuario_asignado_id,
				organizacion_asignada_id,
				tipo_asignacion,
				estado
			)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING *;
		`;

		const values = [
			data.reporte_id,
			data.usuario_asignado_id || null,
			data.organizacion_asignada_id || null,
			data.tipo_asignacion,
			data.estado || 'ACTIVA',
		];

		const result = await pool.query(query, values);
		return result.rows[0];
	}

	async obtenerAsignacionesPorReporte(reporteId) {
		const query = `
			SELECT *
			FROM asignaciones_reporte
			WHERE reporte_id = $1
			ORDER BY asignado_en DESC
		`;
		const result = await pool.query(query, [reporteId]);
		return result.rows;
	}
}

module.exports = new ReportesRepository();