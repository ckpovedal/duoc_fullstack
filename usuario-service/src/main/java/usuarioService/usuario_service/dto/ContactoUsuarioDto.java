package usuarioService.usuario_service.dto;

import usuarioService.usuario_service.model.Usuario;

public record ContactoUsuarioDto(
    String idUsuario,
    String nombre
) {
    public static ContactoUsuarioDto desdeEntidad(Usuario usuario) {
        return new ContactoUsuarioDto(
            usuario.getIdUsuario(),
            usuario.getNombre()
        );
    }
}
