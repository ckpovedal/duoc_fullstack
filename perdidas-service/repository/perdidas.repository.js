const pool = require('../config/pg_db');

class PerdidasRepository {
  async existeUsuario(usuarioId) {
    const query = 'SELECT u_id FROM usuario WHERE u_id = $1';
    const result = await pool.query(query, [usuarioId]);
    return result.rows.length > 0;
  }

  async crearPerdida(data) {
    const query = `
      INSERT INTO perdida (
        u_id,
        p_nom_masc,
        p_tipo,
        p_edad,
        p_genero,
        p_fisica,
        p_perso,
        p_inf_adic,
        p_esterilizado,
        p_vacunas,
        p_imagen,
        p_dire_inter,
        p_comuna,
        p_region,
        p_fecha,
        p_estado
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *;
    `;

    const values = [
      data.u_id || data.U_ID,
      data.p_nom_masc || data.P_Nom_Masc,
      data.p_tipo ?? data.P_Tipo,
      data.p_edad ?? data.P_Edad ?? null,
      data.p_genero ?? data.P_Genero ?? null,
      data.p_fisica || data.P_Fisica || null,
      data.p_perso || data.P_Perso || null,
      data.p_inf_adic || data.P_Inf_Adic || null,
      data.p_esterilizado ?? data.P_Esterilizado ?? null,
      data.p_vacunas ?? data.P_Vacunas ?? null,
      data.p_imagen || data.P_Imagen || null,
      data.p_dire_inter || data.P_Dire_Inter || null,
      data.p_comuna || data.P_Comuna || null,
      data.p_region || data.P_Region || null,
      data.p_fecha || data.P_Fecha || null,
      data.p_estado ?? data.P_Estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarPerdidas(filtros = {}) {
    let query = 'SELECT * FROM perdida WHERE 1=1';
    const values = [];
    let idx = 1;

    const tipo = filtros.p_tipo || filtros.tipo;
    const estado = filtros.p_estado || filtros.estado;
    const comuna = filtros.p_comuna || filtros.comuna;
    const region = filtros.p_region || filtros.region;

    if (tipo) {
      query += ` AND p_tipo = $${idx++}`;
      values.push(tipo);
    }

    if (estado) {
      query += ` AND p_estado = $${idx++}`;
      values.push(estado);
    }

    if (comuna) {
      query += ` AND p_comuna ILIKE $${idx++}`;
      values.push(`%${comuna}%`);
    }

    if (region) {
      query += ` AND p_region ILIKE $${idx++}`;
      values.push(`%${region}%`);
    }

    query += ' ORDER BY p_fecha DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async obtenerPerdidaPorId(id) {
    const query = 'SELECT * FROM perdida WHERE p_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async actualizarPerdida(id, data) {
    const query = `
      UPDATE perdida
      SET
        u_id = $2,
        p_nom_masc = $3,
        p_tipo = $4,
        p_edad = $5,
        p_genero = $6,
        p_fisica = $7,
        p_perso = $8,
        p_inf_adic = $9,
        p_esterilizado = $10,
        p_vacunas = $11,
        p_imagen = $12,
        p_dire_inter = $13,
        p_comuna = $14,
        p_region = $15,
        p_fecha = $16,
        p_estado = $17
      WHERE p_id = $1
      RETURNING *;
    `;

    const values = [
      id,
      data.u_id || data.U_ID,
      data.p_nom_masc || data.P_Nom_Masc,
      data.p_tipo ?? data.P_Tipo,
      data.p_edad ?? data.P_Edad ?? null,
      data.p_genero ?? data.P_Genero ?? null,
      data.p_fisica || data.P_Fisica || null,
      data.p_perso || data.P_Perso || null,
      data.p_inf_adic || data.P_Inf_Adic || null,
      data.p_esterilizado ?? data.P_Esterilizado ?? null,
      data.p_vacunas ?? data.P_Vacunas ?? null,
      data.p_imagen || data.P_Imagen || null,
      data.p_dire_inter || data.P_Dire_Inter || null,
      data.p_comuna || data.P_Comuna || null,
      data.p_region || data.P_Region || null,
      data.p_fecha || data.P_Fecha || null,
      data.p_estado ?? data.P_Estado ?? 1,
    ];

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async cambiarEstadoPerdida(id, estado) {
    const query = `
      UPDATE perdida
      SET p_estado = $2
      WHERE p_id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, estado]);
    return result.rows[0] || null;
  }
}

module.exports = new PerdidasRepository();
