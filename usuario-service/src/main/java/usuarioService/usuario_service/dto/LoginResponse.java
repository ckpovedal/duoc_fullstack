package usuarioService.usuario_service.dto;

public record LoginResponse(
    UsuarioDto usuario,
    String token
) {
}
