package usuarioService.usuario_service.dto;

public class RespuestaDto<T> {
    private String estado;
    private int codigo;
    private String mensaje;
    private T respuesta;

    public RespuestaDto(String estado, int codigo, String mensaje, T respuesta) {
        this.estado = estado;
        this.codigo = codigo;
        this.mensaje = mensaje;
        this.respuesta = respuesta;
    }

    public static <T> RespuestaDto<T> ok(T respuesta, String mensaje, int codigo) {
        return new RespuestaDto<>("OK", codigo, mensaje, respuesta);
    }

    public static <T> RespuestaDto<T> error(T respuesta, String mensaje, int codigo) {
        return new RespuestaDto<>("ERROR", codigo, mensaje, respuesta);
    }

    public String getEstado() {
        return estado;
    }

    public int getCodigo() {
        return codigo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public T getRespuesta() {
        return respuesta;
    }
}
