package usuarioService.usuario_service.exception;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import usuarioService.usuario_service.dto.RespuestaDto;

@RestControllerAdvice
public class ManejadorErrores {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarApiException(ApiException error) {
        int codigo = error.getEstadoHttp().value();
        return ResponseEntity.status(error.getEstadoHttp())
            .body(RespuestaDto.error(Map.of(), error.getMessage(), codigo));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarErrorBaseDatos(DataIntegrityViolationException error) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(RespuestaDto.error(Map.of(), "No se pudo guardar el usuario", 400));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarErrorGeneral(Exception error) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(RespuestaDto.error(Map.of(), "Error interno del usuario-service", 500));
    }
}
