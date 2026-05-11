import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';
import { PerdidaService } from '../../services/perdida.service';
import { HallazgoService } from '../../services/hallazgo.service';
import { COMUNAS_SANTIAGO_RM, REGION_COMUNAS_SANTIAGO_RM } from '../../data/comunas-santiago-rm';

type SeccionPerfil = 'personal' | 'clave' | 'reportes';
type TipoReporteUsuario = 'perdida' | 'hallazgo';

interface FormularioPerfil {
  nombre: string;
  tipo: string;
  direccion: string;
  comuna: string;
  region: string;
  telefono: string;
  correo: string;
}

interface FormularioReporteUsuario {
  nombreMascota: string;
  tipoMascota: string;
  edad: string;
  genero: string;
  fisica: string;
  personalidad: string;
  informacionAdicional: string;
  esterilizado: string;
  vacunas: string;
  direccion: string;
  comuna: string;
  region: string;
  fecha: string;
  estado: string;
}

interface ReporteUsuario {
  id: string;
  tipo: TipoReporteUsuario;
  titulo: string;
  resumen: string;
  estadoTexto: string;
  fechaTexto: string;
  editando: boolean;
  original: any;
  formulario: FormularioReporteUsuario;
}

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MiPerfilPage implements OnInit {
  comunas = COMUNAS_SANTIAGO_RM;
  usuarioId = '';
  fechaRegistro = '';
  cargando = false;
  guardando = false;
  modoEdicion = false;
  seccionActiva: SeccionPerfil = 'personal';
  mensaje = '';
  error = '';
  nuevaClave = '';
  verificacionClave = '';
  formularioOriginal: FormularioPerfil | null = null;
  reportes: ReporteUsuario[] = [];
  reportesCargados = false;
  cargandoReportes = false;
  guardandoReporteId = '';
  errorReportes = '';
  mensajeReportes = '';

  formulario: FormularioPerfil = {
    nombre: '',
    tipo: 'Dueño',
    direccion: '',
    comuna: '',
    region: REGION_COMUNAS_SANTIAGO_RM,
    telefono: '',
    correo: ''
  };

  constructor(
    private usuarioService: UsuarioService,
    private perdidaService: PerdidaService,
    private hallazgoService: HallazgoService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.usuarioId = this.obtenerUsuarioId();

    if (!this.usuarioId) {
      this.router.navigate(['/login']);
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.usuarioService.obtenerUsuario(this.usuarioId)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const usuario = respuesta?.respuesta || respuesta;
          this.cargarFormulario(usuario);
          this.actualizarSesion(usuario);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error, 'No se pudo cargar el perfil');
          this.mostrarMensaje('error', this.error);
        }
      });
  }

  seleccionarSeccion(seccion: SeccionPerfil) {
    this.seccionActiva = seccion;
    this.error = '';
    this.mensaje = '';
    this.errorReportes = '';
    this.mensajeReportes = '';

    if (seccion !== 'personal') {
      this.cancelarEdicionSinNavegar();
    }

    if (seccion !== 'clave') {
      this.limpiarCambioClave();
    }

    if (seccion === 'reportes' && !this.reportesCargados) {
      this.cargarReportes();
    }
  }

  guardarPerfil() {
    if (!this.modoEdicion) {
      return;
    }

    this.error = '';
    this.mensaje = '';

    const errorFormulario = this.validarFormulario();

    if (errorFormulario) {
      this.error = errorFormulario;
      this.mostrarMensaje('error', this.error);
      return;
    }

    this.guardando = true;

    this.usuarioService.actualizarUsuario(this.usuarioId, this.crearPayloadPerfil(null))
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const usuario = respuesta?.respuesta || respuesta;
          this.cargarFormulario(usuario);
          this.actualizarSesion(usuario);
          this.modoEdicion = false;
          this.mensaje = respuesta?.mensaje || 'Perfil actualizado correctamente';
          this.mostrarMensaje('exito', this.mensaje);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error, 'No se pudo actualizar el perfil');
          this.mostrarMensaje('error', this.error);
        }
      });
  }

  guardarClave() {
    this.error = '';
    this.mensaje = '';

    const errorClave = this.validarClave();

    if (errorClave) {
      this.error = errorClave;
      this.mostrarMensaje('error', this.error);
      return;
    }

    this.guardando = true;

    this.usuarioService.actualizarUsuario(this.usuarioId, this.crearPayloadPerfil(this.nuevaClave.trim()))
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const usuario = respuesta?.respuesta || respuesta;
          this.cargarFormulario(usuario);
          this.actualizarSesion(usuario);
          this.limpiarCambioClave();
          this.mensaje = 'Contraseña actualizada correctamente';
          this.mostrarMensaje('exito', this.mensaje);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error, 'No se pudo actualizar la contraseña');
          this.mostrarMensaje('error', this.error);
        }
      });
  }

  habilitarEdicion() {
    this.formularioOriginal = { ...this.formulario };
    this.error = '';
    this.mensaje = '';
    this.modoEdicion = true;
  }

  cancelarEdicion() {
    if (!this.modoEdicion) {
      this.cancelar();
      return;
    }

    this.cancelarEdicionSinNavegar();
  }

  cargarReportes() {
    if (!this.usuarioId) {
      return;
    }

    this.cargandoReportes = true;
    this.errorReportes = '';
    this.mensajeReportes = '';

    forkJoin({
      perdidas: this.perdidaService.listarPerdidas({ u_id: this.usuarioId }),
      hallazgos: this.hallazgoService.listarHallazgos({ u_id: this.usuarioId, limite: 30 })
    })
      .pipe(
        finalize(() => {
          this.cargandoReportes = false;
        })
      )
      .subscribe({
        next: ({ perdidas, hallazgos }) => {
          const listaPerdidas = this.obtenerListaPerdidas(perdidas);
          const listaHallazgos = this.obtenerListaHallazgos(hallazgos);
          this.reportes = [
            ...listaPerdidas.map((perdida: any) => this.normalizarReporte(perdida, 'perdida')),
            ...listaHallazgos.map((hallazgo: any) => this.normalizarReporte(hallazgo, 'hallazgo'))
          ];
          this.reportesCargados = true;
        },
        error: (error) => {
          this.errorReportes = this.obtenerMensajeError(error, 'No se pudieron cargar tus reportes');
          this.mostrarMensaje('error', this.errorReportes);
        }
      });
  }

  editarReporte(reporte: ReporteUsuario) {
    this.reportes = this.reportes.map((item) => ({
      ...item,
      editando: item.id === reporte.id,
      formulario: item.id === reporte.id ? { ...item.formulario } : this.crearFormularioReporte(item.original, item.tipo)
    }));
    this.errorReportes = '';
    this.mensajeReportes = '';
  }

  cancelarEdicionReporte(reporte: ReporteUsuario) {
    reporte.formulario = this.crearFormularioReporte(reporte.original, reporte.tipo);
    reporte.editando = false;
    this.errorReportes = '';
    this.mensajeReportes = '';
  }

  guardarReporte(reporte: ReporteUsuario) {
    const errorReporte = this.validarReporte(reporte);

    if (errorReporte) {
      this.errorReportes = errorReporte;
      this.mostrarMensaje('error', this.errorReportes);
      return;
    }

    this.guardandoReporteId = reporte.id;
    this.errorReportes = '';
    this.mensajeReportes = '';

    const solicitud = reporte.tipo === 'perdida'
      ? this.perdidaService.actualizarPerdida(reporte.id, this.crearPayloadPerdida(reporte))
      : this.hallazgoService.actualizarHallazgo(reporte.id, this.crearPayloadHallazgo(reporte));

    solicitud
      .pipe(
        finalize(() => {
          this.guardandoReporteId = '';
        })
      )
      .subscribe({
        next: (respuesta) => {
          const reporteActualizado = respuesta?.respuesta || respuesta;
          const normalizado = this.normalizarReporte(reporteActualizado, reporte.tipo);
          this.reportes = this.reportes.map((item) => item.id === reporte.id ? normalizado : item);
          this.mensajeReportes = 'Reporte actualizado correctamente';
          this.mostrarMensaje('exito', this.mensajeReportes);
        },
        error: (error) => {
          this.errorReportes = this.obtenerMensajeError(error, 'No se pudo actualizar el reporte');
          this.mostrarMensaje('error', this.errorReportes);
        }
      });
  }

  verReporte(reporte: ReporteUsuario) {
    const ruta = reporte.tipo === 'perdida' ? '/mascota-perdida' : '/mascota-hallada';
    this.router.navigate([ruta, reporte.id]);
  }

  cancelar() {
    this.router.navigate(['/principal']);
  }

  private cargarFormulario(usuario: any) {
    const telefono = usuario?.telefono ?? usuario?.u_fono ?? usuario?.U_Fono ?? '';

    this.usuarioId = usuario?.idUsuario || usuario?.u_id || usuario?.U_ID || this.usuarioId;
    this.fechaRegistro = usuario?.fecha || usuario?.u_fecha || usuario?.U_Fecha || '';
    this.formulario = {
      nombre: usuario?.nombre || usuario?.u_nombre || usuario?.U_Nombre || '',
      tipo: usuario?.tipo || usuario?.u_tipo || usuario?.U_Tipo || 'Dueño',
      direccion: usuario?.direccion || usuario?.u_dire || usuario?.U_Dire || '',
      comuna: usuario?.comuna || usuario?.u_comuna || usuario?.U_Comuna || '',
      region: usuario?.region || usuario?.u_region || usuario?.U_Region || REGION_COMUNAS_SANTIAGO_RM,
      telefono: telefono ? String(telefono) : '',
      correo: usuario?.correo || usuario?.u_correo || usuario?.U_Correo || ''
    };
    this.formularioOriginal = { ...this.formulario };
    this.limpiarCambioClave();
  }

  private crearPayloadPerfil(clave: string | null) {
    const telefono = this.formulario.telefono.trim();

    return {
      nombre: this.formulario.nombre.trim(),
      tipo: this.formulario.tipo.trim(),
      direccion: this.formulario.direccion.trim(),
      comuna: this.formulario.comuna.trim(),
      region: this.formulario.region.trim(),
      telefono: telefono ? Number(telefono) : null,
      correo: this.formulario.correo.trim(),
      clave
    };
  }

  private validarFormulario() {
    const telefono = this.formulario.telefono.trim();

    if (!this.formulario.nombre.trim() || !this.formulario.tipo.trim() || !this.formulario.correo.trim()) {
      return 'Nombre, tipo y correo son obligatorios';
    }

    if (telefono && !/^\d{9}$/.test(telefono)) {
      return 'El telefono debe tener 9 digitos';
    }

    return '';
  }

  private validarClave() {
    const clave = this.nuevaClave.trim();
    const verificacionClave = this.verificacionClave.trim();

    if (!clave || !verificacionClave) {
      return 'Debes ingresar y confirmar la nueva contraseña';
    }

    if (clave !== verificacionClave) {
      return 'Las contraseñas no coinciden';
    }

    if (clave.length < 8 || clave.length > 15) {
      return 'La contraseña debe tener entre 8 y 15 caracteres';
    }

    return '';
  }

  private validarReporte(reporte: ReporteUsuario) {
    if (reporte.tipo === 'perdida' && !reporte.formulario.nombreMascota.trim()) {
      return 'El nombre de la mascota es obligatorio para reportes de perdida';
    }

    if (!reporte.formulario.tipoMascota) {
      return 'El tipo de mascota es obligatorio';
    }

    return '';
  }

  limpiarCambioClave() {
    this.nuevaClave = '';
    this.verificacionClave = '';
  }

  private cancelarEdicionSinNavegar() {
    if (this.formularioOriginal) {
      this.formulario = { ...this.formularioOriginal };
    }

    this.error = '';
    this.mensaje = '';
    this.modoEdicion = false;
  }

  private obtenerListaPerdidas(respuesta: any) {
    const data = respuesta?.respuesta || respuesta?.data || respuesta;
    return Array.isArray(data) ? data : [];
  }

  private obtenerListaHallazgos(respuesta: any) {
    const data = respuesta?.respuesta || respuesta?.data || respuesta;

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.items)) {
      return data.items;
    }

    return [];
  }

  private normalizarReporte(reporte: any, tipo: TipoReporteUsuario): ReporteUsuario {
    const id = tipo === 'perdida'
      ? reporte.p_id || reporte.P_ID
      : reporte.h_id || reporte.H_ID;
    const formulario = this.crearFormularioReporte(reporte, tipo);
    const etiquetaTipo = tipo === 'perdida' ? 'Perdida' : 'Hallazgo';
    const tituloBase = formulario.nombreMascota || (tipo === 'perdida' ? 'Mascota perdida' : 'Mascota hallada');
    const comuna = formulario.comuna || 'Sin comuna';

    return {
      id,
      tipo,
      titulo: tituloBase,
      resumen: `${etiquetaTipo} - ${this.obtenerTipoMascota(formulario.tipoMascota)} en ${comuna}`,
      estadoTexto: this.obtenerEstadoReporte(tipo, formulario.estado),
      fechaTexto: formulario.fecha || 'Sin fecha',
      editando: false,
      original: reporte,
      formulario
    };
  }

  private crearFormularioReporte(reporte: any, tipo: TipoReporteUsuario): FormularioReporteUsuario {
    const prefijo = tipo === 'perdida' ? 'p' : 'h';
    const prefijoMayuscula = tipo === 'perdida' ? 'P' : 'H';

    return {
      nombreMascota: this.obtenerTexto(reporte[`${prefijo}_nom_masc`] ?? reporte[`${prefijoMayuscula}_Nom_Masc`]),
      tipoMascota: this.obtenerTexto(reporte[`${prefijo}_tipo`] ?? reporte[`${prefijoMayuscula}_Tipo`]),
      edad: this.obtenerTexto(reporte[`${prefijo}_edad`] ?? reporte[`${prefijoMayuscula}_Edad`]),
      genero: this.obtenerTexto(reporte[`${prefijo}_genero`] ?? reporte[`${prefijoMayuscula}_Genero`]),
      fisica: this.obtenerTexto(reporte[`${prefijo}_fisica`] ?? reporte[`${prefijoMayuscula}_Fisica`]),
      personalidad: this.obtenerTexto(reporte[`${prefijo}_perso`] ?? reporte[`${prefijoMayuscula}_Perso`]),
      informacionAdicional: this.obtenerTexto(reporte[`${prefijo}_inf_adic`] ?? reporte[`${prefijoMayuscula}_Inf_Adic`]),
      esterilizado: this.obtenerTexto(reporte[`${prefijo}_esterilizado`] ?? reporte[`${prefijoMayuscula}_Esterilizado`]),
      vacunas: this.obtenerTexto(reporte[`${prefijo}_vacunas`] ?? reporte[`${prefijoMayuscula}_Vacunas`]),
      direccion: this.obtenerTexto(reporte[`${prefijo}_dire_inter`] ?? reporte[`${prefijoMayuscula}_Dire_Inter`]),
      comuna: this.obtenerTexto(reporte[`${prefijo}_comuna`] ?? reporte[`${prefijoMayuscula}_Comuna`]),
      region: this.obtenerTexto(reporte[`${prefijo}_region`] ?? reporte[`${prefijoMayuscula}_Region`]) || REGION_COMUNAS_SANTIAGO_RM,
      fecha: this.obtenerFechaInput(reporte[`${prefijo}_fecha`] ?? reporte[`${prefijoMayuscula}_Fecha`]),
      estado: this.obtenerTexto(reporte[`${prefijo}_estado`] ?? reporte[`${prefijoMayuscula}_Estado`]) || '1'
    };
  }

  private crearPayloadPerdida(reporte: ReporteUsuario) {
    const formulario = reporte.formulario;

    return {
      u_id: this.usuarioId,
      p_nom_masc: formulario.nombreMascota.trim(),
      p_tipo: this.obtenerNumero(formulario.tipoMascota),
      p_edad: this.obtenerNumeroOpcional(formulario.edad),
      p_genero: this.obtenerNumeroOpcional(formulario.genero),
      p_fisica: this.obtenerValorOpcional(formulario.fisica),
      p_perso: this.obtenerValorOpcional(formulario.personalidad),
      p_inf_adic: this.obtenerValorOpcional(formulario.informacionAdicional),
      p_esterilizado: this.obtenerNumeroOpcional(formulario.esterilizado),
      p_vacunas: this.obtenerNumeroOpcional(formulario.vacunas),
      p_dire_inter: this.obtenerValorOpcional(formulario.direccion),
      p_comuna: this.obtenerValorOpcional(formulario.comuna),
      p_region: this.obtenerValorOpcional(formulario.region),
      p_fecha: this.obtenerValorOpcional(formulario.fecha),
      p_estado: this.obtenerNumeroOpcional(formulario.estado) || 1
    };
  }

  private crearPayloadHallazgo(reporte: ReporteUsuario) {
    const formulario = reporte.formulario;

    return {
      u_id: this.usuarioId,
      h_nom_masc: this.obtenerValorOpcional(formulario.nombreMascota),
      h_tipo: this.obtenerNumero(formulario.tipoMascota),
      h_edad: this.obtenerNumeroOpcional(formulario.edad),
      h_genero: this.obtenerNumeroOpcional(formulario.genero),
      h_fisica: this.obtenerValorOpcional(formulario.fisica),
      h_perso: this.obtenerValorOpcional(formulario.personalidad),
      h_inf_adic: this.obtenerValorOpcional(formulario.informacionAdicional),
      h_esterilizado: this.obtenerNumeroOpcional(formulario.esterilizado),
      h_vacunas: this.obtenerNumeroOpcional(formulario.vacunas),
      h_dire_inter: this.obtenerValorOpcional(formulario.direccion),
      h_comuna: this.obtenerValorOpcional(formulario.comuna),
      h_region: this.obtenerValorOpcional(formulario.region),
      h_fecha: this.obtenerValorOpcional(formulario.fecha),
      h_estado: this.obtenerNumeroOpcional(formulario.estado) || 1
    };
  }

  private obtenerUsuarioId() {
    const usuarioId = localStorage.getItem('usuario_id');

    if (usuarioId) {
      return usuarioId;
    }

    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return '';
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      return usuario?.idUsuario || usuario?.u_id || usuario?.U_ID || '';
    } catch {
      return '';
    }
  }

  private actualizarSesion(usuario: any) {
    if (!usuario) {
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));

    if (usuario?.idUsuario || usuario?.u_id || usuario?.U_ID) {
      localStorage.setItem('usuario_id', usuario.idUsuario || usuario.u_id || usuario.U_ID);
    }
  }

  private obtenerTexto(valor: any) {
    if (valor === undefined || valor === null) {
      return '';
    }

    return String(valor);
  }

  private obtenerValorOpcional(valor: any) {
    const texto = this.obtenerTexto(valor).trim();
    return texto ? texto : null;
  }

  private obtenerNumero(valor: any) {
    return Number(this.obtenerTexto(valor).trim());
  }

  private obtenerNumeroOpcional(valor: any) {
    const texto = this.obtenerTexto(valor).trim();
    const numero = Number(texto);
    return texto && Number.isFinite(numero) ? numero : null;
  }

  private obtenerFechaInput(valor: any) {
    const texto = this.obtenerTexto(valor).trim();
    return texto ? texto.slice(0, 10) : '';
  }

  private obtenerTipoMascota(valor: string) {
    const tipos: Record<string, string> = {
      '1': 'Perro',
      '2': 'Gato',
      '3': 'Otro'
    };

    return tipos[valor] || 'Mascota';
  }

  private obtenerEstadoReporte(tipo: TipoReporteUsuario, valor: string) {
    if (tipo === 'perdida') {
      return valor === '2' ? 'Resuelto' : valor === '3' ? 'Inactivo' : 'Activo';
    }

    return valor === '2' ? 'Reunificado' : valor === '3' ? 'Inactivo' : 'Activo';
  }

  private obtenerMensajeError(error: any, mensajeGenerico: string) {
    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios esten encendidos';
    }

    return error?.error?.mensaje || mensajeGenerico;
  }

  private async mostrarMensaje(tipo: 'error' | 'exito', texto: string) {
    const toast = await this.toastController.create({
      message: `Sanos y Salvos dice: ${texto}`,
      duration: tipo === 'error' ? 4500 : 3000,
      position: 'bottom',
      color: tipo === 'error' ? 'danger' : 'success',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }
}
