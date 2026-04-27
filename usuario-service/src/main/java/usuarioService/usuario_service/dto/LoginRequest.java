package usuarioService.usuario_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record LoginRequest(
    @JsonAlias({"u_correo", "U_Correo", "email"}) String correo,
    @JsonAlias({"u_pass", "U_Pass", "password", "pass"}) String clave
) {
}
