package usuarioService.usuario_service.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus estadoHttp;

    public ApiException(String mensaje, HttpStatus estadoHttp) {
        super(mensaje);
        this.estadoHttp = estadoHttp;
    }

    public HttpStatus getEstadoHttp() {
        return estadoHttp;
    }
}
