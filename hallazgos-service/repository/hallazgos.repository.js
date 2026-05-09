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
      data.h_edad || data.H_Edad || null,
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
    let query = 'SELECT * FROM hallazgo WHERE 1=1';
    const values = [];
    let idx = 1;

    const tipo = filtros.h_tipo || filtros.tipo;
    const estado = filtros.h_estado || filtros.estado;
    const comuna = filtros.h_comuna || filtros.comuna;
    const region = filtros.h_region || filtros.region;

    if (tipo) {
      query += ` AND h_tipo = $${idx++}`;
      values.push(tipo);
    }

    if (estado) {
      query += ` AND h_estado = $${idx++}`;
      values.push(estado);
    }

    if (comuna) {
      query += ` AND h_comuna ILIKE $${idx++}`;
      values.push(`%${comuna}%`);
    }

    if (region) {
      query += ` AND h_region ILIKE $${idx++}`;
      values.push(`%${region}%`);
    }

    query += ' ORDER BY h_fecha DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  async obtenerHallazgoPorId(id) {
    const query = 'SELECT * FROM hallazgo WHERE h_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new HallazgosRepository();
