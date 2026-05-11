const pool = require('../config/pg_db');

class HallazgosRepository {
  async crearHallazgo(data) {
    const query = `
      INSERT INTO hallazgo (
        u_id,
        h_nom_masc,
        h_tipo,
        h_edad,
        h_genero,
        h_fisica,
        h_perso,
        h_inf_adic,
        h_esterilizado,
        h_vacunas,
        h_imagen,
        h_dire_inter,
        h_comuna,
        h_region,
        h_fecha,
        h_estado
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, COALESCE($15::date, CURRENT_DATE), $16
      )
      RETURNING *;
    `;

    const values = [
      data.u_id || data.U_ID,
      data.h_nom_masc || data.H_Nom_Masc || null,
      data.h_tipo ?? data.H_Tipo,
      data.h_edad ?? data.H_Edad ?? null,
      data.h_genero ?? data.H_Genero ?? null,
      data.h_fisica || data.H_Fisica || null,
      data.h_perso || data.H_Perso || null,
      data.h_inf_adic || data.H_Inf_Adic || null,
      data.h_esterilizado ?? data.H_Esterilizado ?? null,
      data.h_vacunas ?? data.H_Vacunas ?? null,
      data.h_imagen || data.H_Imagen || null,
      data.h_dire_inter || data.H_Dire_Inter || null,
      data.h_comuna || data.H_Comuna || null,
      data.h_region || data.H_Region || null,
      data.h_fecha || data.H_Fecha || null,
      data.h_estado ?? data.H_Estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarHallazgos(filtros = {}) {
    let where = 'WHERE 1=1';
    const values = [];
    let idx = 1;

    const tipo = filtros.h_tipo || filtros.tipo;
    const estado = filtros.h_estado || filtros.estado;
    const comuna = filtros.h_comuna || filtros.comuna;
    const region = filtros.h_region || filtros.region;
    const usuarioId = filtros.u_id || filtros.usuario_id || filtros.usuarioId;
    const texto = filtros.texto;
    const pagina = Math.max(Number(filtros.pagina) || 1, 1);
    const limite = Math.min(Math.max(Number(filtros.limite) || 10, 1), 30);
    const offset = (pagina - 1) * limite;

    if (tipo) {
      where += ` AND h_tipo = $${idx++}`;
      values.push(tipo);
    }

    if (estado) {
      where += ` AND h_estado = $${idx++}`;
      values.push(estado);
    }

    if (comuna) {
      where += ` AND h_comuna ILIKE $${idx++}`;
      values.push(`%${comuna}%`);
    }

    if (region) {
      where += ` AND h_region ILIKE $${idx++}`;
      values.push(`%${region}%`);
    }

    if (usuarioId) {
      where += ` AND u_id = $${idx++}`;
      values.push(usuarioId);
    }

    if (texto) {
      where += ` AND (
        h_nom_masc ILIKE $${idx}
        OR h_fisica ILIKE $${idx}
        OR h_inf_adic ILIKE $${idx}
        OR h_comuna ILIKE $${idx}
        OR h_region ILIKE $${idx}
      )`;
      values.push(`%${texto}%`);
      idx++;
    }

    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM hallazgo ${where}`,
      values
    );

    const query = `
      SELECT *
      FROM hallazgo
      ${where}
      ORDER BY h_fecha DESC, h_id DESC
      LIMIT $${idx++}
      OFFSET $${idx}
    `;

    const result = await pool.query(query, [...values, limite, offset]);
    const total = totalResult.rows[0]?.total || 0;

    return {
      items: result.rows,
      paginacion: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
        tieneMas: pagina * limite < total
      }
    };
  }

  async obtenerHallazgoPorId(id) {
    const query = 'SELECT * FROM hallazgo WHERE h_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async actualizarHallazgo(id, data) {
    const query = `
      UPDATE hallazgo
      SET
        u_id = $2,
        h_nom_masc = $3,
        h_tipo = $4,
        h_edad = $5,
        h_genero = $6,
        h_fisica = $7,
        h_perso = $8,
        h_inf_adic = $9,
        h_esterilizado = $10,
        h_vacunas = $11,
        h_imagen = $12,
        h_dire_inter = $13,
        h_comuna = $14,
        h_region = $15,
        h_fecha = $16,
        h_estado = $17
      WHERE h_id = $1
      RETURNING *;
    `;

    const values = [
      id,
      data.u_id || data.U_ID,
      data.h_nom_masc || data.H_Nom_Masc || null,
      data.h_tipo ?? data.H_Tipo,
      data.h_edad ?? data.H_Edad ?? null,
      data.h_genero ?? data.H_Genero ?? null,
      data.h_fisica || data.H_Fisica || null,
      data.h_perso || data.H_Perso || null,
      data.h_inf_adic || data.H_Inf_Adic || null,
      data.h_esterilizado ?? data.H_Esterilizado ?? null,
      data.h_vacunas ?? data.H_Vacunas ?? null,
      data.h_imagen || data.H_Imagen || null,
      data.h_dire_inter || data.H_Dire_Inter || null,
      data.h_comuna || data.H_Comuna || null,
      data.h_region || data.H_Region || null,
      data.h_fecha || data.H_Fecha || null,
      data.h_estado ?? data.H_Estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}

module.exports = new HallazgosRepository();
