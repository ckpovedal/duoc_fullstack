const pool = require('../config/pg_db');

class GeolocalizacionRepository {
  async guardarUbicacion(data) {
    const query = `
      INSERT INTO geo_ubicacion (
        tipo_reporte,
        reporte_id,
        u_id,
        geo_direccion,
        geo_comuna,
        geo_region,
        geo_latitud,
        geo_longitud,
        geo_fuente,
        geo_fecha,
        geo_estado
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        COALESCE($10::date, CURRENT_DATE), $11
      )
      ON CONFLICT (tipo_reporte, reporte_id)
      DO UPDATE SET
        u_id = EXCLUDED.u_id,
        geo_direccion = EXCLUDED.geo_direccion,
        geo_comuna = EXCLUDED.geo_comuna,
        geo_region = EXCLUDED.geo_region,
        geo_latitud = EXCLUDED.geo_latitud,
        geo_longitud = EXCLUDED.geo_longitud,
        geo_fuente = EXCLUDED.geo_fuente,
        geo_fecha = EXCLUDED.geo_fecha,
        geo_estado = EXCLUDED.geo_estado
      RETURNING *;
    `;

    const values = [
      data.tipo_reporte,
      data.reporte_id,
      data.u_id,
      data.geo_direccion,
      data.geo_comuna || null,
      data.geo_region || null,
      data.geo_latitud,
      data.geo_longitud,
      data.geo_fuente,
      data.geo_fecha || null,
      data.geo_estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarUbicaciones(filtros = {}) {
    const consulta = this.construirConsultaUbicaciones(filtros);

    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM geo_ubicacion ${consulta.where}`,
      consulta.values
    );

    const query = `
      SELECT
        *,
        ${consulta.distanciaSelect}
      FROM geo_ubicacion
      ${consulta.where}
      ${consulta.orderBy}
      LIMIT $${consulta.values.length + 1}
      OFFSET $${consulta.values.length + 2}
    `;

    const result = await pool.query(query, [...consulta.values, consulta.limite, consulta.offset]);
    const total = totalResult.rows[0]?.total || 0;

    return {
      items: result.rows,
      paginacion: {
        pagina: consulta.pagina,
        limite: consulta.limite,
        total,
        totalPaginas: Math.ceil(total / consulta.limite),
        tieneMas: consulta.pagina * consulta.limite < total
      }
    };
  }

  construirConsultaUbicaciones(filtros = {}) {
    let where = 'WHERE 1=1';
    const values = [];
    let idx = 1;
    let distanciaSelect = 'NULL::numeric AS distancia_km';
    let orderBy = 'ORDER BY geo_fecha DESC, geo_id DESC';

    const tipoReporte = filtros.tipo_reporte || filtros.tipoReporte;
    const reporteId = filtros.reporte_id || filtros.reporteId;
    const usuarioId = filtros.u_id || filtros.usuario_id || filtros.usuarioId;
    const comuna = filtros.geo_comuna || filtros.comuna;
    const region = filtros.geo_region || filtros.region;
    const estado = filtros.geo_estado || filtros.estado;
    const latitud = filtros.geo_latitud || filtros.latitud;
    const longitud = filtros.geo_longitud || filtros.longitud;
    const radioKm = filtros.radio_km || filtros.radioKm || filtros.radio;

    if (tipoReporte) {
      where += ` AND tipo_reporte = $${idx++}`;
      values.push(tipoReporte);
    }

    if (reporteId) {
      where += ` AND reporte_id = $${idx++}`;
      values.push(reporteId);
    }

    if (usuarioId) {
      where += ` AND u_id = $${idx++}`;
      values.push(usuarioId);
    }

    if (comuna) {
      where += ` AND geo_comuna ILIKE $${idx++}`;
      values.push(`%${comuna}%`);
    }

    if (region) {
      where += ` AND geo_region ILIKE $${idx++}`;
      values.push(`%${region}%`);
    }

    if (estado) {
      where += ` AND geo_estado = $${idx++}`;
      values.push(estado);
    }

    if (latitud !== undefined && longitud !== undefined && radioKm !== undefined) {
      const latIdx = idx++;
      const lonIdx = idx++;
      const radioIdx = idx++;

      values.push(latitud, longitud, radioKm);

      const puntoReferencia = `ST_SetSRID(ST_MakePoint($${lonIdx}, $${latIdx}), 4326)::geography`;
      where += ` AND ST_DWithin(geo_punto, ${puntoReferencia}, $${radioIdx} * 1000)`;
      distanciaSelect = `ROUND((ST_Distance(geo_punto, ${puntoReferencia}) / 1000)::numeric, 3) AS distancia_km`;
      orderBy = 'ORDER BY distancia_km ASC, geo_fecha DESC';
    }

    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 50, 1), 200);
    const offset = (pagina - 1) * limite;

    return {
      where,
      values,
      pagina,
      limite,
      offset,
      distanciaSelect,
      orderBy
    };
  }

  async obtenerUbicacionPorId(id) {
    const query = 'SELECT * FROM geo_ubicacion WHERE geo_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async obtenerUbicacionPorReporte(tipoReporte, reporteId) {
    const query = `
      SELECT *
      FROM geo_ubicacion
      WHERE tipo_reporte = $1
        AND reporte_id = $2
    `;
    const result = await pool.query(query, [tipoReporte, reporteId]);
    return result.rows[0] || null;
  }

  async actualizarUbicacion(id, data) {
    const query = `
      UPDATE geo_ubicacion
      SET
        tipo_reporte = $2,
        reporte_id = $3,
        u_id = $4,
        geo_direccion = $5,
        geo_comuna = $6,
        geo_region = $7,
        geo_latitud = $8,
        geo_longitud = $9,
        geo_fuente = $10,
        geo_fecha = COALESCE($11::date, geo_fecha),
        geo_estado = $12
      WHERE geo_id = $1
      RETURNING *;
    `;

    const values = [
      id,
      data.tipo_reporte,
      data.reporte_id,
      data.u_id,
      data.geo_direccion,
      data.geo_comuna || null,
      data.geo_region || null,
      data.geo_latitud,
      data.geo_longitud,
      data.geo_fuente,
      data.geo_fecha || null,
      data.geo_estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async cambiarEstadoUbicacion(id, estado) {
    const query = `
      UPDATE geo_ubicacion
      SET geo_estado = $2
      WHERE geo_id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, estado]);
    return result.rows[0] || null;
  }

  async crearZonaInteres(data) {
    const query = `
      INSERT INTO geo_zona_interes (
        u_id,
        zon_nombre,
        zon_direccion,
        zon_comuna,
        zon_region,
        zon_latitud,
        zon_longitud,
        zon_radio_km,
        zon_tipo_reporte,
        zon_activa,
        zon_fecha
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        COALESCE($11::date, CURRENT_DATE)
      )
      RETURNING *;
    `;

    const values = [
      data.u_id,
      data.zon_nombre || null,
      data.zon_direccion || null,
      data.zon_comuna || null,
      data.zon_region || null,
      data.zon_latitud,
      data.zon_longitud,
      data.zon_radio_km,
      data.zon_tipo_reporte,
      data.zon_activa ?? 1,
      data.zon_fecha || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarZonasInteres(filtros = {}) {
    const consulta = this.construirConsultaZonas(filtros);

    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM geo_zona_interes ${consulta.where}`,
      consulta.values
    );

    const query = `
      SELECT
        *,
        ${consulta.distanciaSelect}
      FROM geo_zona_interes
      ${consulta.where}
      ${consulta.orderBy}
      LIMIT $${consulta.values.length + 1}
      OFFSET $${consulta.values.length + 2}
    `;

    const result = await pool.query(query, [...consulta.values, consulta.limite, consulta.offset]);
    const total = totalResult.rows[0]?.total || 0;

    return {
      items: result.rows,
      paginacion: {
        pagina: consulta.pagina,
        limite: consulta.limite,
        total,
        totalPaginas: Math.ceil(total / consulta.limite),
        tieneMas: consulta.pagina * consulta.limite < total
      }
    };
  }

  construirConsultaZonas(filtros = {}) {
    let where = 'WHERE 1=1';
    const values = [];
    let idx = 1;
    let distanciaSelect = 'NULL::numeric AS distancia_km';
    let orderBy = 'ORDER BY zon_fecha DESC, zon_id DESC';

    const usuarioId = filtros.u_id || filtros.usuario_id || filtros.usuarioId;
    const comuna = filtros.zon_comuna || filtros.comuna;
    const region = filtros.zon_region || filtros.region;
    const tipoReporte = filtros.zon_tipo_reporte || filtros.tipo_reporte || filtros.tipoReporte;
    const activa = filtros.zon_activa || filtros.activa;
    const latitud = filtros.zon_latitud || filtros.latitud;
    const longitud = filtros.zon_longitud || filtros.longitud;
    const radioKm = filtros.radio_km || filtros.radioKm || filtros.radio;

    if (usuarioId) {
      where += ` AND u_id = $${idx++}`;
      values.push(usuarioId);
    }

    if (comuna) {
      where += ` AND zon_comuna ILIKE $${idx++}`;
      values.push(`%${comuna}%`);
    }

    if (region) {
      where += ` AND zon_region ILIKE $${idx++}`;
      values.push(`%${region}%`);
    }

    if (tipoReporte) {
      where += ` AND zon_tipo_reporte IN ($${idx++}, 'AMBOS')`;
      values.push(tipoReporte);
    }

    if (activa) {
      where += ` AND zon_activa = $${idx++}`;
      values.push(activa);
    }

    if (latitud !== undefined && longitud !== undefined && radioKm !== undefined) {
      const latIdx = idx++;
      const lonIdx = idx++;
      const radioIdx = idx++;

      values.push(latitud, longitud, radioKm);

      const puntoReferencia = `ST_SetSRID(ST_MakePoint($${lonIdx}, $${latIdx}), 4326)::geography`;
      where += ` AND ST_DWithin(zon_punto, ${puntoReferencia}, $${radioIdx} * 1000)`;
      distanciaSelect = `ROUND((ST_Distance(zon_punto, ${puntoReferencia}) / 1000)::numeric, 3) AS distancia_km`;
      orderBy = 'ORDER BY distancia_km ASC, zon_fecha DESC';
    }

    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 50, 1), 200);
    const offset = (pagina - 1) * limite;

    return {
      where,
      values,
      pagina,
      limite,
      offset,
      distanciaSelect,
      orderBy
    };
  }

  async obtenerZonaInteresPorId(id) {
    const query = 'SELECT * FROM geo_zona_interes WHERE zon_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async actualizarZonaInteres(id, data) {
    const query = `
      UPDATE geo_zona_interes
      SET
        u_id = $2,
        zon_nombre = $3,
        zon_direccion = $4,
        zon_comuna = $5,
        zon_region = $6,
        zon_latitud = $7,
        zon_longitud = $8,
        zon_radio_km = $9,
        zon_tipo_reporte = $10,
        zon_activa = $11,
        zon_fecha = COALESCE($12::date, zon_fecha)
      WHERE zon_id = $1
      RETURNING *;
    `;

    const values = [
      id,
      data.u_id,
      data.zon_nombre || null,
      data.zon_direccion || null,
      data.zon_comuna || null,
      data.zon_region || null,
      data.zon_latitud,
      data.zon_longitud,
      data.zon_radio_km,
      data.zon_tipo_reporte,
      data.zon_activa ?? 1,
      data.zon_fecha || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async cambiarEstadoZonaInteres(id, activa) {
    const query = `
      UPDATE geo_zona_interes
      SET zon_activa = $2
      WHERE zon_id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, activa]);
    return result.rows[0] || null;
  }
}

module.exports = new GeolocalizacionRepository();
