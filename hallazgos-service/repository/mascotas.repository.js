const pool = require('../config/pg_db');

class MascotasRepository {
  async existeUsuario(usuarioId) {
    const query = 'SELECT id FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [usuarioId]);
    return result.rows.length > 0;
  }

  async crearMascota(data) {
    const query = `
      INSERT INTO mascotas (
        dueno_usuario_id,
        nombre,
        especie,
        raza,
        sexo,
        tamano,
        color_principal,
        color_secundario,
        fecha_nacimiento,
        codigo_microchip,
        esterilizado,
        marcas_distintivas
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *;
    `;

    const values = [
      data.dueno_usuario_id || null,
      data.nombre || null,
      data.especie,
      data.raza || null,
      data.sexo || 'DESCONOCIDO',
      data.tamano || null,
      data.color_principal || null,
      data.color_secundario || null,
      data.fecha_nacimiento || null,
      data.codigo_microchip || null,
      data.esterilizado ?? null,
      data.marcas_distintivas || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async listarMascotas() {
    const query = 'SELECT * FROM mascotas ORDER BY creado_en DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  async obtenerMascotaPorId(id) {
    const query = 'SELECT * FROM mascotas WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new MascotasRepository();