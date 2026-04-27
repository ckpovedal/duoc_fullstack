package usuarioService.usuario_service.dto;

import java.time.LocalDate;
import usuarioService.usuario_service.model.Usuario;

public record UsuarioDto(
    String idUsuario,
    String nombre,
    String tipo,
    String direccion,
    String comuna,
    String region,
    Integer telefono,
    String correo,
    LocalDate fecha
) {
    public static UsuarioDto desdeEntidad(Usuario usuario) {
        return new UsuarioDto(
            usuario.getIdUsuario(),
            usuario.getNombre(),
            usuario.getTipo(),
            usuario.getDireccion(),
            usuario.getComuna(),
            usuario.getRegion(),
            usuario.getTelefono(),
            usuario.getCorreo(),
            usuario.getFecha()
        );
    }
}
