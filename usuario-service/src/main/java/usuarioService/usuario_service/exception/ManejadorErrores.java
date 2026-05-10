package usuarioService.usuario_service.exception;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import usuarioService.usuario_service.dto.RespuestaDto;

@RestControllerAdvice
public class ManejadorErrores {
    private static final Logger logger = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarApiException(ApiException error) {
        int codigo = error.getEstadoHttp().value();
        logger.warn("Error controlado en usuario-service: {}", error.getMessage());
        return ResponseEntity.status(error.getEstadoHttp())
            .body(RespuestaDto.error(Map.of(), error.getMessage(), codigo));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarErrorBaseDatos(DataIntegrityViolationException error) {
        logger.warn("No se pudo guardar el usuario por una restriccion de datos");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(RespuestaDto.error(Map.of(), "No se pudo guardar el usuario", 400));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespuestaDto<Map<String, Object>>> manejarErrorGeneral(Exception error) {
        logger.error("Error interno en usuario-service", error);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(RespuestaDto.error(Map.of(), "Error interno del usuario-service", 500));
    }
}
