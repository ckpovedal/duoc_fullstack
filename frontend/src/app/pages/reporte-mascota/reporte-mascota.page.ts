import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, of, switchMap, timeout } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, locateOutline, pawOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { COMUNAS_SANTIAGO_RM, REGION_COMUNAS_SANTIAGO_RM } from '../../data/comunas-santiago-rm';
import { GeolocalizacionService } from '../../services/geolocalizacion.service';
import { HallazgoService } from '../../services/hallazgo.service';
import { PerdidaService } from '../../services/perdida.service';

const TAMANO_MAXIMO_IMAGEN_BYTES = 30 * 1024 * 1024;

type TipoReporte = 'perdida' | 'hallazgo';
type TipoMascota = 'perro' | 'gato' | 'otro';
type UnidadEdad = 'meses' | 'anios';

interface FormularioReporteMascota {
  nombreMascota: string;
  edad: string;
  unidadEdad: UnidadEdad;
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

interface UbicacionSeleccionada {
  latitud: number;
  longitud: number;
  fuente: 'NOMINATIM' | 'GPS' | 'MANUAL';
}

@Component({
  selector: 'app-reporte-mascota',
  templateUrl: './reporte-mascota.page.html',
  styleUrls: ['./reporte-mascota.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReporteMascotaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaUbicacion') mapaUbicacion?: ElementRef<HTMLDivElement>;

  tipoReporte: TipoReporte = 'perdida';
  tipoMascota: TipoMascota = 'perro';
  comunas = COMUNAS_SANTIAGO_RM;
  cargando = false;
  mensaje = '';
  error = '';
  imagenVistaPrevia = '';
  geocodificandoUbicacion = false;
  ubicacionTexto = 'Completa la direccion y comuna para ubicar el reporte en el mapa';
  ubicacionSeleccionada: UbicacionSeleccionada | null = null;

  private mapa?: L.Map;
  private marcador?: L.Marker;
  private temporizadorGeocodificacion?: ReturnType<typeof setTimeout>;
  private marcadorIcono = L.divIcon({
    className: 'marcador-ubicacion',
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  formulario: FormularioReporteMascota = {
    nombreMascota: '',
    edad: '',
    unidadEdad: 'anios',
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
    private geolocalizacionService: GeolocalizacionService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ cameraOutline, locateOutline, pawOutline });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 250);
  }

  ngOnDestroy() {
    if (this.temporizadorGeocodificacion) {
      clearTimeout(this.temporizadorGeocodificacion);
    }

    if (this.mapa) {
      this.mapa.remove();
    }
  }

  seleccionarTipoReporte(tipoReporte: TipoReporte) {
    this.tipoReporte = tipoReporte;
    this.error = '';
    this.mensaje = '';
  }

  seleccionarTipoMascota(tipoMascota: TipoMascota) {
    this.tipoMascota = tipoMascota;
  }

  programarGeocodificacion() {
    this.ubicacionSeleccionada = null;
    this.ubicacionTexto = 'Buscando ubicacion aproximada...';

    if (this.temporizadorGeocodificacion) {
      clearTimeout(this.temporizadorGeocodificacion);
    }

    this.temporizadorGeocodificacion = setTimeout(() => {
      this.geocodificarYActualizarMapa();
    }, 750);
  }

  async usarUbicacionActual() {
    try {
      const posicion = await this.obtenerUbicacionActual();
      this.actualizarUbicacionMapa(posicion.latitud, posicion.longitud, 'GPS');
      this.ubicacionTexto = 'Ubicacion actual seleccionada. Puedes mover el pin para ajustarla';
    } catch {
      this.mostrarMensaje('error', 'No se pudo obtener tu ubicacion actual');
    }
  }

  async mostrarMensaje(tipo: 'error' | 'exito', texto: string) {
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

  seleccionarFoto(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN_BYTES) {
      this.error = 'La imagen supera el maximo permitido de 30 MB. Selecciona una imagen mas liviana';
      this.mostrarMensaje('error', this.error);
      input.value = '';
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.error = 'Selecciona un archivo de imagen';
      this.mostrarMensaje('error', this.error);
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
      this.mostrarMensaje('error', this.error);
      return;
    }

    if (this.tipoReporte === 'perdida' && !this.formulario.nombreMascota.trim()) {
      this.error = 'El nombre de la mascota es obligatorio para reportar una perdida';
      this.mostrarMensaje('error', this.error);
      return;
    }

    if (!this.formulario.comuna.trim()) {
      this.error = 'La comuna es obligatoria';
      this.mostrarMensaje('error', this.error);
      return;
    }

    const errorEdad = this.validarEdad();

    if (errorEdad) {
      this.error = errorEdad;
      this.mostrarMensaje('error', this.error);
      return;
    }

    this.cargando = true;

    this.obtenerCoordenadasParaGuardar()
      .pipe(
        switchMap((coordenadas) => {
          const datosGeolocalizacion = {
            ...coordenadas,
            geo_direccion: this.obtenerDireccionGeolocalizacion()
          };

          const payload = this.tipoReporte === 'hallazgo'
            ? {
                ...this.crearPayloadHallazgo(usuarioId),
                ...datosGeolocalizacion
              }
            : {
                ...this.crearPayloadPerdida(usuarioId),
                ...datosGeolocalizacion
              };

          return this.tipoReporte === 'hallazgo'
            ? this.hallazgoService.crearHallazgo(payload)
            : this.perdidaService.crearPerdida(payload);
        }),
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const rutaDestino = this.tipoReporte === 'hallazgo' ? '/mascotas-halladas' : '/principal';
          this.mensaje = respuesta?.mensaje || 'Reporte guardado correctamente';
          this.mostrarMensaje('exito', this.mensaje);
          this.limpiarFormulario();
          setTimeout(() => {
            this.router.navigate([rutaDestino]);
          }, 1200);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mostrarMensaje('error', this.error);
        }
      });
  }

  cancelar() {
    this.router.navigate(['/principal']);
  }

  private inicializarMapa() {
    if (!this.mapaUbicacion || this.mapa) {
      return;
    }

    const centroInicial: L.LatLngExpression = [-33.4489, -70.6693];

    this.mapa = L.map(this.mapaUbicacion.nativeElement, {
      center: centroInicial,
      zoom: 11,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);

    this.marcador = L.marker(centroInicial, {
      draggable: true,
      icon: this.marcadorIcono
    }).addTo(this.mapa);

    this.marcador.on('dragend', () => {
      const posicion = this.marcador?.getLatLng();

      if (!posicion) {
        return;
      }

      this.ubicacionSeleccionada = {
        latitud: posicion.lat,
        longitud: posicion.lng,
        fuente: 'MANUAL'
      };
      this.ubicacionTexto = 'Ubicacion ajustada manualmente';
    });

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 300);
  }

  private crearPayloadHallazgo(usuarioId: string) {
    return {
      u_id: usuarioId,
      h_nom_masc: this.valorOpcional(this.formulario.nombreMascota),
      h_tipo: this.obtenerTipoMascota(),
      h_edad: this.obtenerEdadEnMeses(),
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

  private geocodificarFormulario() {
    const direccion = this.valorOpcional(this.formulario.direccion);
    const comuna = this.valorOpcional(this.formulario.comuna);
    const region = this.valorOpcional(this.formulario.region);
    const direccionBusqueda = direccion || comuna;

    if (!direccionBusqueda) {
      throw new Error('Debes ingresar una direccion o comuna para geolocalizar el reporte');
    }

    return this.geolocalizacionService.geocodificar({
      direccion: direccionBusqueda,
      comuna: comuna || undefined,
      region: region || undefined,
      limite: 1
    });
  }

  private geocodificarYActualizarMapa() {
    const direccion = this.valorOpcional(this.formulario.direccion);
    const comuna = this.valorOpcional(this.formulario.comuna);

    if (!direccion && !comuna) {
      this.ubicacionTexto = 'Completa la direccion y comuna para ubicar el reporte en el mapa';
      return;
    }

    this.geocodificandoUbicacion = true;

    this.geocodificarFormulario()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.geocodificandoUbicacion = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const coordenadas = this.obtenerCoordenadasDesdeRespuesta(respuesta);
          this.actualizarUbicacionMapa(coordenadas.geo_latitud, coordenadas.geo_longitud, 'NOMINATIM');
          this.ubicacionTexto = 'Ubicacion aproximada encontrada. Puedes mover el pin para ajustarla';
        },
        error: () => {
          this.ubicacionTexto = 'No se pudo ubicar automaticamente. Puedes usar tu ubicacion actual';
        }
      });
  }

  private obtenerCoordenadasParaGuardar() {
    if (this.ubicacionSeleccionada) {
      return of({
        geo_latitud: this.ubicacionSeleccionada.latitud,
        geo_longitud: this.ubicacionSeleccionada.longitud,
        geo_fuente: this.ubicacionSeleccionada.fuente
      });
    }

    return this.geocodificarFormulario().pipe(
      switchMap((respuestaGeo) => {
        const coordenadas = this.obtenerCoordenadasDesdeRespuesta(respuestaGeo);
        return of(coordenadas);
      })
    );
  }

  private obtenerCoordenadasDesdeRespuesta(respuesta: any) {
    const data = respuesta?.respuesta || respuesta?.data || respuesta;
    const resultado = data?.resultados?.[0];

    if (!resultado || resultado.latitud === null || resultado.longitud === null) {
      throw new Error('No se pudo obtener una ubicacion valida para la direccion ingresada');
    }

    return {
      geo_latitud: Number(resultado.latitud),
      geo_longitud: Number(resultado.longitud),
      geo_fuente: 'NOMINATIM'
    };
  }

  private actualizarUbicacionMapa(latitud: number, longitud: number, fuente: UbicacionSeleccionada['fuente']) {
    this.ubicacionSeleccionada = {
      latitud,
      longitud,
      fuente
    };

    const posicion: L.LatLngExpression = [latitud, longitud];

    this.marcador?.setLatLng(posicion);
    this.mapa?.setView(posicion, 16);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 100);
  }

  private async obtenerUbicacionActual() {
    if (Capacitor.isNativePlatform()) {
      await Geolocation.requestPermissions();
      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude
      };
    }

    if (!navigator.geolocation) {
      throw new Error('Geolocalizacion no disponible');
    }

    return new Promise<{ latitud: number; longitud: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          resolve({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude
          });
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  private obtenerDireccionGeolocalizacion() {
    const direccion = this.valorOpcional(this.formulario.direccion);
    const comuna = this.valorOpcional(this.formulario.comuna);
    const region = this.valorOpcional(this.formulario.region);

    return [direccion, comuna, region].filter(Boolean).join(', ');
  }

  private crearPayloadPerdida(usuarioId: string) {
    return {
      u_id: usuarioId,
      p_nom_masc: this.formulario.nombreMascota.trim(),
      p_tipo: this.obtenerTipoMascota(),
      p_edad: this.obtenerEdadEnMeses(),
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

  private valorOpcional(valor: any) {
    if (valor === undefined || valor === null) {
      return null;
    }

    const texto = String(valor).trim();
    return texto ? texto : null;
  }

  private valorNumericoOpcional(valor: any) {
    if (valor === undefined || valor === null) {
      return null;
    }

    const texto = String(valor).trim();
    const numero = Number(texto);
    return Number.isFinite(numero) && texto !== '' ? numero : null;
  }

  private validarEdad() {
    const edad = this.valorNumericoOpcional(this.formulario.edad);

    if (edad === null) {
      return '';
    }

    if (!Number.isInteger(edad)) {
      return 'La edad debe ser un numero entero';
    }

    if (this.formulario.unidadEdad === 'meses' && (edad < 0 || edad > 11)) {
      return 'Si indicas la edad en meses, debe estar entre 0 y 11 meses';
    }

    if (this.formulario.unidadEdad === 'anios' && (edad < 1 || edad > 99)) {
      return 'Si indicas la edad en anos, debe estar entre 1 y 99 anos';
    }

    return '';
  }

  private obtenerEdadEnMeses() {
    const edad = this.valorNumericoOpcional(this.formulario.edad);

    if (edad === null) {
      return null;
    }

    if (this.formulario.unidadEdad === 'meses') {
      return edad;
    }

    return edad * 12;
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

  private obtenerMensajeError(error: any) {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondio a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios esten encendidos';
    }

    if (error?.status === 413) {
      return 'La imagen es demasiado pesada. Selecciona una imagen mas liviana e intenta nuevamente';
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return error?.error?.mensaje || 'No se pudo guardar el reporte. Intenta nuevamente';
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
      unidadEdad: 'anios',
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
