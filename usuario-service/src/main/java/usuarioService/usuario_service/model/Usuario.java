package usuarioService.usuario_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @Column(name = "u_id", length = 40)
    private String idUsuario;

    @Column(name = "u_nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "u_tipo", nullable = false, length = 50)
    private String tipo;

    @Column(name = "u_dire", length = 100)
    private String direccion;

    @Column(name = "u_comuna", length = 30)
    private String comuna;

    @Column(name = "u_region", length = 50)
    private String region;

    @Column(name = "u_fono")
    private Integer telefono;

    @Column(name = "u_correo", nullable = false, unique = true, length = 50)
    private String correo;

    @Column(name = "u_pass", nullable = false, length = 255)
    private String clave;

    @Column(name = "u_fecha")
    private LocalDate fecha;

    public String getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(String idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getComuna() {
        return comuna;
    }

    public void setComuna(String comuna) {
        this.comuna = comuna;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public Integer getTelefono() {
        return telefono;
    }

    public void setTelefono(Integer telefono) {
        this.telefono = telefono;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}
