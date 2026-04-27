package usuarioService.usuario_service.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record UsuarioRequest(
    @JsonAlias({"u_nombre", "U_Nombre"}) String nombre,
    @JsonAlias({"u_tipo", "U_Tipo"}) String tipo,
    @JsonAlias({"u_dire", "U_Dire"}) String direccion,
    @JsonAlias({"u_comuna", "U_Comuna"}) String comuna,
    @JsonAlias({"u_region", "U_Region"}) String region,
    @JsonAlias({"u_fono", "U_Fono"}) Integer telefono,
    @JsonAlias({"u_correo", "U_Correo", "email"}) String correo,
    @JsonAlias({"u_pass", "U_Pass", "password", "pass"}) String clave
) {
}
