const mascotasRepository = require('../repository/mascotas.repository');
const AppError = require('../utils/AppError');

class MascotasService {
  async crearMascota(data) {
    if (!data.especie) {
      throw new AppError('especie es obligatoria', 400);
    }

    if (data.dueno_usuario_id) {
      const usuarioExiste = await mascotasRepository.existeUsuario(data.dueno_usuario_id);

      if (!usuarioExiste) {
        throw new AppError('El dueño indicado no existe', 404);
      }
    }

    return await mascotasRepository.crearMascota(data);
  }

  async listarMascotas() {
    return await mascotasRepository.listarMascotas();
  }

  async obtenerMascotaPorId(id) {
    const mascota = await mascotasRepository.obtenerMascotaPorId(id);

    if (!mascota) {
      throw new AppError('Mascota no encontrada', 404);
    }

    return mascota;
  }
}

module.exports = new MascotasService();