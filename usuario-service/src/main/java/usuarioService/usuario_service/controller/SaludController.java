package usuarioService.usuario_service.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import usuarioService.usuario_service.dto.RespuestaDto;

@RestController
public class SaludController {
    @GetMapping("/health")
    public ResponseEntity<RespuestaDto<Map<String, Object>>> revisarSalud() {
        return ResponseEntity.ok(RespuestaDto.ok(Map.of(), "Usuario service operativo", 200));
    }
}
