package usuarioService.usuario_service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import usuarioService.usuario_service.dto.LoginRequest;
import usuarioService.usuario_service.dto.UsuarioDto;
import usuarioService.usuario_service.dto.UsuarioRequest;
import usuarioService.usuario_service.exception.ApiException;
import usuarioService.usuario_service.model.Usuario;
import usuarioService.usuario_service.repository.UsuarioRepository;

@Service
public class UsuarioService {
    private static final Set<String> TIPOS_VALIDOS = Set.of("Dueño", "Voluntario", "Rescatista");

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioDto> listarUsuarios() {
        return usuarioRepository.findAll()
            .stream()
            .map(UsuarioDto::desdeEntidad)
            .toList();
    }

    public UsuarioDto obtenerUsuarioPorId(String idUsuario) {
        return UsuarioDto.desdeEntidad(buscarUsuario(idUsuario));
    }

    public UsuarioDto crearUsuario(UsuarioRequest solicitud) {
        validarSolicitud(solicitud);

        if (usuarioRepository.existsByCorreo(solicitud.correo())) {
            throw new ApiException("El correo ya esta registrado", HttpStatus.BAD_REQUEST);
        }

        Usuario usuario = new Usuario();
        usuario.setIdUsuario(usuarioRepository.generarIdUsuario());
        usuario.setFecha(LocalDate.now());
        aplicarDatos(usuario, solicitud);
        validarUsuario(usuario);

        return UsuarioDto.desdeEntidad(usuarioRepository.save(usuario));
    }

    public UsuarioDto actualizarUsuario(String idUsuario, UsuarioRequest solicitud) {
        validarSolicitud(solicitud);

        Usuario usuario = buscarUsuario(idUsuario);
        String correoAnterior = usuario.getCorreo();

        aplicarDatos(usuario, solicitud);
        validarUsuario(usuario);

        if (!correoAnterior.equals(usuario.getCorreo()) && usuarioRepository.existsByCorreo(usuario.getCorreo())) {
            throw new ApiException("El correo ya esta registrado", HttpStatus.BAD_REQUEST);
        }

        return UsuarioDto.desdeEntidad(usuarioRepository.save(usuario));
    }

    public UsuarioDto iniciarSesion(LoginRequest solicitud) {
        if (solicitud == null || estaVacio(solicitud.correo()) || estaVacio(solicitud.clave())) {
            throw new ApiException("Correo y clave son obligatorios", HttpStatus.BAD_REQUEST);
        }

        Usuario usuario = usuarioRepository.findByCorreoAndClave(solicitud.correo(), solicitud.clave())
            .orElseThrow(() -> new ApiException("Correo o clave incorrectos", HttpStatus.UNAUTHORIZED));

        return UsuarioDto.desdeEntidad(usuario);
    }

    private Usuario buscarUsuario(String idUsuario) {
        return usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ApiException("Usuario no encontrado", HttpStatus.NOT_FOUND));
    }

    private void aplicarDatos(Usuario usuario, UsuarioRequest solicitud) {
        usuario.setNombre(solicitud.nombre());
        usuario.setTipo(solicitud.tipo());
        usuario.setDireccion(solicitud.direccion());
        usuario.setComuna(solicitud.comuna());
        usuario.setRegion(solicitud.region());
        usuario.setTelefono(solicitud.telefono());
        usuario.setCorreo(solicitud.correo());
        usuario.setClave(solicitud.clave());
    }

    private void validarSolicitud(UsuarioRequest solicitud) {
        if (solicitud == null) {
            throw new ApiException("Los datos del usuario son obligatorios", HttpStatus.BAD_REQUEST);
        }
    }

    private void validarUsuario(Usuario usuario) {
        if (estaVacio(usuario.getNombre())) {
            throw new ApiException("nombre es obligatorio", HttpStatus.BAD_REQUEST);
        }

        if (estaVacio(usuario.getTipo())) {
            throw new ApiException("tipo es obligatorio", HttpStatus.BAD_REQUEST);
        }

        if (!TIPOS_VALIDOS.contains(usuario.getTipo())) {
            throw new ApiException("tipo debe ser Dueño, Voluntario o Rescatista", HttpStatus.BAD_REQUEST);
        }

        if (estaVacio(usuario.getCorreo())) {
            throw new ApiException("correo es obligatorio", HttpStatus.BAD_REQUEST);
        }

        if (estaVacio(usuario.getClave())) {
            throw new ApiException("clave es obligatoria", HttpStatus.BAD_REQUEST);
        }

        if (usuario.getClave().length() < 4 || usuario.getClave().length() > 15) {
            throw new ApiException("clave debe tener entre 4 y 15 caracteres", HttpStatus.BAD_REQUEST);
        }

        if (usuario.getTelefono() != null && (usuario.getTelefono() < 100000000 || usuario.getTelefono() > 999999999)) {
            throw new ApiException("telefono debe tener 9 digitos", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean estaVacio(String valor) {
        return valor == null || valor.trim().isEmpty();
    }
}
