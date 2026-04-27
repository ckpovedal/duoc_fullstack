package usuarioService.usuario_service.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import usuarioService.usuario_service.dto.LoginRequest;
import usuarioService.usuario_service.dto.RespuestaDto;
import usuarioService.usuario_service.dto.UsuarioDto;
import usuarioService.usuario_service.dto.UsuarioRequest;
import usuarioService.usuario_service.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<RespuestaDto<List<UsuarioDto>>> listarUsuarios() {
        List<UsuarioDto> usuarios = usuarioService.listarUsuarios();
        return ResponseEntity.ok(RespuestaDto.ok(usuarios, "Usuarios obtenidos correctamente", 200));
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<RespuestaDto<UsuarioDto>> obtenerUsuarioPorId(@PathVariable String idUsuario) {
        UsuarioDto usuario = usuarioService.obtenerUsuarioPorId(idUsuario);
        return ResponseEntity.ok(RespuestaDto.ok(usuario, "Usuario obtenido correctamente", 200));
    }

    @PostMapping
    public ResponseEntity<RespuestaDto<UsuarioDto>> crearUsuario(@RequestBody UsuarioRequest solicitud) {
        UsuarioDto usuario = usuarioService.crearUsuario(solicitud);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(RespuestaDto.ok(usuario, "Usuario creado correctamente", 201));
    }

    @PutMapping("/{idUsuario}")
    public ResponseEntity<RespuestaDto<UsuarioDto>> actualizarUsuario(
        @PathVariable String idUsuario,
        @RequestBody UsuarioRequest solicitud
    ) {
        UsuarioDto usuario = usuarioService.actualizarUsuario(idUsuario, solicitud);
        return ResponseEntity.ok(RespuestaDto.ok(usuario, "Usuario actualizado correctamente", 200));
    }

    @PostMapping("/login")
    public ResponseEntity<RespuestaDto<UsuarioDto>> iniciarSesion(@RequestBody LoginRequest solicitud) {
        UsuarioDto usuario = usuarioService.iniciarSesion(solicitud);
        return ResponseEntity.ok(RespuestaDto.ok(usuario, "Inicio de sesion correcto", 200));
    }
}
