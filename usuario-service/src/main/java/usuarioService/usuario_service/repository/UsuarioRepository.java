package usuarioService.usuario_service.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import usuarioService.usuario_service.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByCorreoAndClave(String correo, String clave);

    boolean existsByCorreo(String correo);

    @Query(value = "SELECT generar_u_id()", nativeQuery = true)
    String generarIdUsuario();
}
