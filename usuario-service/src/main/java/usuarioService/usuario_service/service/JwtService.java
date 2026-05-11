package usuarioService.usuario_service.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import usuarioService.usuario_service.dto.UsuarioDto;

@Service
public class JwtService {
    @Value("${app.jwt.secret}")
    private String secreto;

    @Value("${app.jwt.expiracion-ms}")
    private long expiracionMs;

    public String generarToken(UsuarioDto usuario) {
        long emitidoEn = System.currentTimeMillis() / 1000;
        long expiracion = emitidoEn + (expiracionMs / 1000);

        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{"
            + "\"sub\":" + jsonTexto(usuario.idUsuario()) + ","
            + "\"tipo\":" + jsonTexto(usuario.tipo()) + ","
            + "\"correo\":" + jsonTexto(usuario.correo()) + ","
            + "\"iat\":" + emitidoEn + ","
            + "\"exp\":" + expiracion
            + "}";
        String contenido = codificar(header.getBytes(StandardCharsets.UTF_8)) + "."
            + codificar(payload.getBytes(StandardCharsets.UTF_8));

        return contenido + "." + firmar(contenido);
    }

    private String jsonTexto(String valor) {
        if (valor == null) {
            return "\"\"";
        }

        return "\"" + valor
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t") + "\"";
    }

    private String firmar(String contenido) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return codificar(mac.doFinal(contenido.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception error) {
            throw new IllegalStateException("No fue posible firmar el token", error);
        }
    }

    private String codificar(byte[] datos) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(datos);
    }
}
