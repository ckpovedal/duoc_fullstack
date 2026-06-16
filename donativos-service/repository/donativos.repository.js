const pool = require('../config/pg_db');

class DonativosRepository {
  async crearDonativo(data) {
    const query = `
      INSERT INTO DONATIVO (
        U_ID,
        D_NOMBRE_DONANTE,
        D_CORREO_DONANTE,
        D_MONTO,
        D_MONEDA,
        D_MENSAJE,
        D_ESTADO,
        D_METODO_PAGO
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      data.u_id,
      data.d_nombre_donante,
      data.d_correo_donante,
      data.d_monto,
      data.d_moneda,
      data.d_mensaje,
      data.d_estado,
      data.d_metodo_pago
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async obtenerResumen() {
    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN D_ESTADO = 2 THEN D_MONTO ELSE 0 END), 0) AS total_recaudado,
        COUNT(*) AS cantidad_donativos,
        COUNT(*) FILTER (WHERE D_ESTADO = 1) AS pendientes,
        COUNT(*) FILTER (WHERE D_ESTADO = 2) AS aprobados,
        COUNT(*) FILTER (WHERE D_ESTADO = 3) AS rechazados
      FROM DONATIVO;
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  async listarPorUsuario(usuarioId) {
    const query = `
      SELECT *
      FROM DONATIVO
      WHERE U_ID = $1
      ORDER BY D_FECHA DESC;
    `;

    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  async listarTodos() {
    const query = `
      SELECT *
      FROM DONATIVO
      ORDER BY D_FECHA DESC;
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async obtenerPorId(id) {
    const query = `
      SELECT *
      FROM DONATIVO
      WHERE D_ID = $1;
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new DonativosRepository();
