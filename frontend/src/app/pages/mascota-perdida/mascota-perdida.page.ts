import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chatbubbleEllipsesOutline, chevronBackOutline, locationOutline, pawOutline, personOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { PerdidaService } from '../../services/perdida.service';
import { GeolocalizacionService } from '../../services/geolocalizacion.service';
import { MensajeriaService } from '../../services/mensajeria.service';
import { SesionService } from '../../services/sesion.service';
import {
  formatearFechaReporte,
  obtenerClaseEstado,
  obtenerEdadMascota,
  obtenerEstadoPerdida,
  obtenerGeneroMascota,
  obtenerImagenMascota,
  obtenerRespuestaReporte,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface MascotaPerdidaVista {
  id: string;
  usuarioId: string;
  nombre: string;
  tipo: string;
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
  imagen: string;
  estado: string;
  estadoClase: string;
  publicadoPor: string;
  ubicacion: UbicacionReporteVista | null;
}

interface UbicacionReporteVista {
  latitud: number;
  longitud: number;
}

@Component({
  selector: 'app-mascota-perdida',
  templateUrl: './mascota-perdida.page.html',
  styleUrls: ['./mascota-perdida.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MascotaPerdidaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaDetalle') mapaDetalle?: ElementRef<HTMLDivElement>;

  mascota: MascotaPerdidaVista | null = null;
  cargando = false;
  contactando = false;
  error = '';
  private mapa?: L.Map;
  private marcador?: L.Marker;
  private marcadorIcono = L.divIcon({
    className: 'marcador-ubicacion',
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perdidaService: PerdidaService,
    private geolocalizacionService: GeolocalizacionService,
    private mensajeriaService: MensajeriaService,
    private sesionService: SesionService
  ) {
    addIcons({ calendarOutline, chatbubbleEllipsesOutline, chevronBackOutline, locationOutline, pawOutline, personOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el reporte solicitado';
      return;
    }

    this.cargarPerdida(id);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 250);
  }

  ngOnDestroy() {
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  volver() {
    this.router.navigate(['/buscador']);
  }

  puedeContactar() {
    if (!this.mascota || !this.sesionService.sesionActiva()) {
      return false;
    }

    const usuarioActualId = this.sesionService.obtenerUsuarioId();
    return !!usuarioActualId && !!this.mascota.usuarioId && usuarioActualId !== this.mascota.usuarioId;
  }

  contactar() {
    if (!this.mascota || !this.puedeContactar()) {
      return;
    }

    const usuarioActualId = this.sesionService.obtenerUsuarioId();

    if (!usuarioActualId) {
      return;
    }

    this.contactando = true;
    this.error = '';

    this.mensajeriaService.crearConversacion({
      tipoReporte: 'PERDIDA',
      reporteId: this.mascota.id,
      uIdDueno: this.mascota.usuarioId,
      uIdContacto: usuarioActualId
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.contactando = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/mensajes']);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
        }
      });
  }

  cargarPerdida(id: string) {
    this.cargando = true;
    this.error = '';

    this.perdidaService.obtenerPerdida(id)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;

          console.log('Detalle pérdida completo:', data);
          console.log('Campos disponibles:', Object.keys(data));

          this.mascota = this.normalizarPerdida(data);
          this.cargarUbicacionReporte(id);
        }, error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mascota = null;
        }
      });
  }

  private normalizarPerdida(perdida: any): MascotaPerdidaVista {
    const estado = perdida.p_estado ?? perdida.P_Estado;

    return {
      id: obtenerTextoReporte(perdida.p_id ?? perdida.P_ID, ''),
      usuarioId: obtenerTextoReporte(perdida.u_id ?? perdida.U_ID, ''),
      nombre: obtenerTextoReporte(perdida.p_nom_masc ?? perdida.P_Nom_Masc, 'Mascota perdida'),
      tipo: obtenerTipoMascota(perdida.p_tipo ?? perdida.P_Tipo),
      edad: obtenerEdadMascota(perdida.p_edad ?? perdida.P_Edad),
      genero: obtenerGeneroMascota(perdida.p_genero ?? perdida.P_Genero),
      fisica: obtenerTextoReporte(perdida.p_fisica ?? perdida.P_Fisica, 'Sin registrar'),
      personalidad: obtenerTextoReporte(perdida.p_perso ?? perdida.P_Perso, 'Sin registrar'),
      informacionAdicional: obtenerTextoReporte(perdida.p_inf_adic ?? perdida.P_Inf_Adic, 'Sin registrar'),
      esterilizado: obtenerRespuestaReporte(perdida.p_esterilizado ?? perdida.P_Esterilizado),
      vacunas: obtenerRespuestaReporte(perdida.p_vacunas ?? perdida.P_Vacunas),
      direccion: obtenerTextoReporte(perdida.p_dire_inter ?? perdida.P_Dire_Inter, 'Sin registrar'),
      comuna: obtenerTextoReporte(perdida.p_comuna ?? perdida.P_Comuna, 'Sin registrar'),
      region: obtenerTextoReporte(perdida.p_region ?? perdida.P_Region, 'Sin registrar'),
      fecha: formatearFechaReporte(perdida.p_fecha ?? perdida.P_Fecha),
      imagen: obtenerImagenMascota(perdida.p_imagen ?? perdida.P_Imagen),
      estado: obtenerEstadoPerdida(estado),
      estadoClase: obtenerClaseEstado(estado),
      publicadoPor: obtenerTextoReporte(
        perdida.usuario_nombre ??
        perdida.Usuario_Nombre ??
        perdida.nombre_usuario ??
        perdida.Nombre_Usuario ??
        perdida.p_usuario ??
        perdida.P_Usuario,
        'Usuario no informado'
      ),
      ubicacion: null
    };
  }

  private cargarUbicacionReporte(id: string) {
    this.geolocalizacionService.obtenerUbicacionReporte('PERDIDA', id)
      .pipe(timeout(10000))
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;
          const latitud = Number(data?.latitud ?? data?.geo_latitud);
          const longitud = Number(data?.longitud ?? data?.geo_longitud);

          if (!Number.isFinite(latitud) || !Number.isFinite(longitud) || !this.mascota) {
            return;
          }

          this.mascota = {
            ...this.mascota,
            ubicacion: {
              latitud,
              longitud
            }
          };

          setTimeout(() => {
            this.inicializarMapa();
            this.actualizarMapa(latitud, longitud);
          }, 100);
        },
        error: () => {}
      });
  }

  private inicializarMapa() {
    if (!this.mapaDetalle || this.mapa) {
      return;
    }

    const centroInicial: L.LatLngExpression = [-33.4489, -70.6693];

    this.mapa = L.map(this.mapaDetalle.nativeElement, {
      center: centroInicial,
      zoom: 13,
      zoomControl: true,
      dragging: false,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);

    this.marcador = L.marker(centroInicial, {
      draggable: false,
      icon: this.marcadorIcono
    }).addTo(this.mapa);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 300);
  }

  private actualizarMapa(latitud: number, longitud: number) {
    const posicion: L.LatLngExpression = [latitud, longitud];

    this.marcador?.setLatLng(posicion);
    this.mapa?.setView(posicion, 16);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 100);
  }

  private obtenerMensajeError(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudo cargar el reporte';
  }
}
