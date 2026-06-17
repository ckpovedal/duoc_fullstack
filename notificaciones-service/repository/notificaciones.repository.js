const pool = require('../config/pg_db');

class NotificacionesRepository {
  async registrarDispositivo(data) {
    const query = `
      INSERT INTO DISPOSITIVO_PUSH (
        U_ID,
        DP_TOKEN,
        DP_PLATAFORMA,
        DP_MODELO,
        DP_ESTADO
      )
      VALUES ($1, $2, $3, $4, 1)
      ON CONFLICT (DP_TOKEN)
      DO UPDATE SET
        U_ID = EXCLUDED.U_ID,
        DP_PLATAFORMA = EXCLUDED.DP_PLATAFORMA,
        DP_MODELO = EXCLUDED.DP_MODELO,
        DP_ESTADO = 1,
        DP_FECHA_ACTUALIZA = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      data.u_id,
      data.dp_token,
      data.dp_plataforma,
      data.dp_modelo || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async desactivarDispositivo(usuarioId, token) {
    const query = `
      UPDATE DISPOSITIVO_PUSH
      SET DP_ESTADO = 2,
          DP_FECHA_ACTUALIZA = CURRENT_TIMESTAMP
      WHERE U_ID = $1
      AND DP_TOKEN = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [usuarioId, token]);
    return result.rows[0] || null;
  }

  async listarDispositivosActivos(usuarioId) {
    const query = `
      SELECT *
      FROM DISPOSITIVO_PUSH
      WHERE U_ID = $1
      AND DP_ESTADO = 1
      ORDER BY DP_FECHA_ACTUALIZA DESC;
    `;

    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  async crearNotificacion(data) {
    const query = `
      INSERT INTO NOTIFICACION (
        U_ID_DESTINO,
        NOT_TITULO,
        NOT_CUERPO,
        NOT_TIPO,
        NOT_DATA,
        NOT_LEIDA,
        NOT_ENVIADA,
        NOT_ERROR,
        NOT_FECHA_ENVIO
      )
      VALUES ($1, $2, $3, $4, $5, 2, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      data.u_id_destino,
      data.not_titulo,
      data.not_cuerpo,
      data.not_tipo,
      JSON.stringify(data.not_data || {}),
      data.not_enviada,
      data.not_error || null,
      data.not_fecha_envio || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarNotificaciones(usuarioId) {
    const query = `
      SELECT *
      FROM NOTIFICACION
      WHERE U_ID_DESTINO = $1
      ORDER BY NOT_FECHA DESC
      LIMIT 100;
    `;

    const result = await pool.query(query, [usuarioId]);
    return result.rows;
  }

  async marcarLeida(id, usuarioId) {
    const query = `
      UPDATE NOTIFICACION
      SET NOT_LEIDA = 1
      WHERE NOT_ID = $1
      AND U_ID_DESTINO = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [id, usuarioId]);
    return result.rows[0] || null;
  }

  async obtenerPreferencias(usuarioId) {
    const query = `
      INSERT INTO PREFERENCIA_NOTIFICACION (U_ID)
      VALUES ($1)
      ON CONFLICT (U_ID)
      DO UPDATE SET U_ID = EXCLUDED.U_ID
      RETURNING *;
    `;

    const result = await pool.query(query, [usuarioId]);
    return result.rows[0];
  }
}

module.exports = new NotificacionesRepository();
