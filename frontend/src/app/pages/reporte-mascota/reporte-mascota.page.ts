import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, pawOutline } from 'ionicons/icons';
import { COMUNAS_SANTIAGO_RM, REGION_COMUNAS_SANTIAGO_RM } from '../../data/comunas-santiago-rm';
import { HallazgoService } from '../../services/hallazgo.service';
import { PerdidaService } from '../../services/perdida.service';

type TipoReporte = 'perdida' | 'hallazgo';
type TipoMascota = 'perro' | 'gato' | 'otro';

interface FormularioReporteMascota {
  nombreMascota: string;
  edad: string;
  genero: string;
  fisica: string;
  personalidad: string;
  informacionAdicional: string;
  esterilizado: string;
  vacunas: string;
  imagen: string;
  direccion: string;
  comuna: string;
  region: string;
  fecha: string;
}

@Component({
  selector: 'app-reporte-mascota',
  templateUrl: './reporte-mascota.page.html',
  styleUrls: ['./reporte-mascota.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReporteMascotaPage implements OnInit {
  tipoReporte: TipoReporte = 'perdida';
  tipoMascota: TipoMascota = 'perro';
  comunas = COMUNAS_SANTIAGO_RM;
  cargando = false;
  mensaje = '';
  error = '';
  imagenVistaPrevia = '';

  formulario: FormularioReporteMascota = {
    nombreMascota: '',
    edad: '',
    genero: '3',
    fisica: '',
    personalidad: '',
    informacionAdicional: '',
    esterilizado: '3',
    vacunas: '3',
    imagen: '',
    direccion: '',
    comuna: '',
    region: REGION_COMUNAS_SANTIAGO_RM,
    fecha: ''
  };

  constructor(
    private hallazgoService: HallazgoService,
    private perdidaService: PerdidaService,
    private router: Router
  ) {
    addIcons({ cameraOutline, pawOutline });
  }

  ngOnInit() {
  }

  seleccionarTipoReporte(tipoReporte: TipoReporte) {
    this.tipoReporte = tipoReporte;
    this.error = '';
    this.mensaje = '';
  }

  seleccionarTipoMascota(tipoMascota: TipoMascota) {
    this.tipoMascota = tipoMascota;
  }

  seleccionarFoto(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.error = 'Selecciona un archivo de imagen';
      input.value = '';
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      const resultado = String(lector.result || '');
      this.imagenVistaPrevia = resultado;
      this.formulario.imagen = this.convertirDataUrlABytea(resultado);
      this.error = '';
    };

    lector.readAsDataURL(archivo);
  }

  guardarReporte() {
    this.error = '';
    this.mensaje = '';

    const usuarioId = this.obtenerUsuarioId();

    if (!usuarioId) {
      this.error = 'Debes iniciar sesion para guardar el reporte';
      return;
    }

    if (this.tipoReporte === 'perdida' && !this.formulario.nombreMascota.trim()) {
      this.error = 'El nombre de la mascota es obligatorio para reportar una perdida';
      return;
    }

    if (!this.formulario.comuna.trim()) {
      this.error = 'La comuna es obligatoria';
      return;
    }

    this.cargando = true;

    const servicio = this.tipoReporte === 'hallazgo'
      ? this.hallazgoService.crearHallazgo(this.crearPayloadHallazgo(usuarioId))
      : this.perdidaService.crearPerdida(this.crearPayloadPerdida(usuarioId));

    servicio.subscribe({
      next: () => {
        const rutaDestino = this.tipoReporte === 'hallazgo' ? '/hallazgos' : '/principal';
        this.mensaje = 'Reporte guardado correctamente';
        this.limpiarFormulario();
        setTimeout(() => {
          this.router.navigate([rutaDestino]);
        }, 1200);
      },
      error: (error) => {
        this.error = error?.error?.mensaje || 'No se pudo guardar el reporte';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/principal']);
  }

  private crearPayloadHallazgo(usuarioId: string) {
    return {
      u_id: usuarioId,
      h_nom_masc: this.valorOpcional(this.formulario.nombreMascota),
      h_tipo: this.obtenerTipoMascota(),
      h_edad: this.valorOpcional(this.formulario.edad),
      h_genero: this.valorNumericoOpcional(this.formulario.genero),
      h_fisica: this.valorOpcional(this.formulario.fisica),
      h_perso: this.valorOpcional(this.formulario.personalidad),
      h_inf_adic: this.valorOpcional(this.formulario.informacionAdicional),
      h_esterilizado: this.valorNumericoOpcional(this.formulario.esterilizado),
      h_vacunas: this.valorNumericoOpcional(this.formulario.vacunas),
      h_imagen: this.valorOpcional(this.formulario.imagen),
      h_dire_inter: this.valorOpcional(this.formulario.direccion),
      h_comuna: this.valorOpcional(this.formulario.comuna),
      h_region: this.valorOpcional(this.formulario.region),
      h_fecha: this.valorOpcional(this.formulario.fecha),
      h_estado: 1
    };
  }

  private crearPayloadPerdida(usuarioId: string) {
    return {
      u_id: usuarioId,
      p_nom_masc: this.formulario.nombreMascota.trim(),
      p_tipo: this.obtenerTipoMascota(),
      p_edad: this.valorNumericoOpcional(this.formulario.edad),
      p_genero: this.valorNumericoOpcional(this.formulario.genero),
      p_fisica: this.valorOpcional(this.formulario.fisica),
      p_perso: this.valorOpcional(this.formulario.personalidad),
      p_inf_adic: this.valorOpcional(this.formulario.informacionAdicional),
      p_esterilizado: this.valorNumericoOpcional(this.formulario.esterilizado),
      p_vacunas: this.valorNumericoOpcional(this.formulario.vacunas),
      p_imagen: this.valorOpcional(this.formulario.imagen),
      p_dire_inter: this.valorOpcional(this.formulario.direccion),
      p_comuna: this.valorOpcional(this.formulario.comuna),
      p_region: this.valorOpcional(this.formulario.region),
      p_fecha: this.valorOpcional(this.formulario.fecha),
      p_estado: 1
    };
  }

  private obtenerTipoMascota() {
    const tipos: Record<TipoMascota, number> = {
      perro: 1,
      gato: 2,
      otro: 3
    };

    return tipos[this.tipoMascota];
  }

  private valorOpcional(valor: string) {
    const texto = valor.trim();
    return texto ? texto : null;
  }

  private valorNumericoOpcional(valor: string) {
    const texto = valor.trim();
    const numero = Number(texto);
    return Number.isFinite(numero) && texto !== '' ? numero : null;
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

  private convertirDataUrlABytea(dataUrl: string) {
    const base64 = dataUrl.split(',')[1] || '';
    const binario = atob(base64);
    let hexadecimal = '\\x';

    for (let i = 0; i < binario.length; i += 1) {
      hexadecimal += binario.charCodeAt(i).toString(16).padStart(2, '0');
    }

    return hexadecimal;
  }

  private limpiarFormulario() {
    this.formulario = {
      nombreMascota: '',
      edad: '',
      genero: '3',
      fisica: '',
      personalidad: '',
      informacionAdicional: '',
      esterilizado: '3',
      vacunas: '3',
      imagen: '',
      direccion: '',
      comuna: '',
      region: REGION_COMUNAS_SANTIAGO_RM,
      fecha: ''
    };
    this.imagenVistaPrevia = '';
    this.tipoReporte = 'perdida';
    this.tipoMascota = 'perro';
  }

}
