import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chatbubbleEllipsesOutline, chevronBackOutline, locationOutline, pawOutline, personOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { HallazgoService } from '../../services/hallazgo.service';
import { GeolocalizacionService } from '../../services/geolocalizacion.service';
import { MensajeriaService } from '../../services/mensajeria.service';
import { SesionService } from '../../services/sesion.service';
import {
  formatearFechaReporte,
  obtenerClaseEstado,
  obtenerEdadMascota,
  obtenerEstadoHallazgo,
  obtenerGeneroMascota,
  obtenerImagenMascota,
  obtenerRespuestaReporte,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface MascotaHalladaVista {
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
  selector: 'app-mascota-hallada',
  templateUrl: './mascota-hallada.page.html',
  styleUrls: ['./mascota-hallada.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MascotaHalladaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaDetalle') mapaDetalle?: ElementRef<HTMLDivElement>;

  mascota: MascotaHalladaVista | null = null;
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
    private hallazgoService: HallazgoService,
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

    this.cargarHallazgo(id);
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
      tipoReporte: 'HALLAZGO',
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
        next: (respuesta) => {
          const conversacion = respuesta?.respuesta || respuesta?.data || respuesta;
          const conversacionId = conversacion?.conv_id ?? conversacion?.CONV_ID;
          this.router.navigate(conversacionId ? ['/mensajes', conversacionId] : ['/mensajes']);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
        }
      });
  }

  cargarHallazgo(id: string) {
    this.cargando = true;
    this.error = '';

    this.hallazgoService.obtenerHallazgo(id)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;
          this.mascota = this.normalizarHallazgo(data);
          this.cargarUbicacionReporte(id);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mascota = null;
        }
      });
  }

  private normalizarHallazgo(hallazgo: any): MascotaHalladaVista {
    const estado = hallazgo.h_estado ?? hallazgo.H_Estado;

    return {
      id: obtenerTextoReporte(hallazgo.h_id ?? hallazgo.H_ID, ''),
      usuarioId: obtenerTextoReporte(hallazgo.u_id ?? hallazgo.U_ID, ''),
      nombre: obtenerTextoReporte(hallazgo.h_nom_masc ?? hallazgo.H_Nom_Masc, 'Mascota hallada'),
      tipo: obtenerTipoMascota(hallazgo.h_tipo ?? hallazgo.H_Tipo),
      edad: obtenerEdadMascota(hallazgo.h_edad ?? hallazgo.H_Edad),
      genero: obtenerGeneroMascota(hallazgo.h_genero ?? hallazgo.H_Genero),
      fisica: obtenerTextoReporte(hallazgo.h_fisica ?? hallazgo.H_Fisica, 'Sin registrar'),
      personalidad: obtenerTextoReporte(hallazgo.h_perso ?? hallazgo.H_Perso, 'Sin registrar'),
      informacionAdicional: obtenerTextoReporte(hallazgo.h_inf_adic ?? hallazgo.H_Inf_Adic, 'Sin registrar'),
      esterilizado: obtenerRespuestaReporte(hallazgo.h_esterilizado ?? hallazgo.H_Esterilizado),
      vacunas: obtenerRespuestaReporte(hallazgo.h_vacunas ?? hallazgo.H_Vacunas),
      direccion: obtenerTextoReporte(hallazgo.h_dire_inter ?? hallazgo.H_Dire_Inter, 'Sin registrar'),
      comuna: obtenerTextoReporte(hallazgo.h_comuna ?? hallazgo.H_Comuna, 'Sin registrar'),
      region: obtenerTextoReporte(hallazgo.h_region ?? hallazgo.H_Region, 'Sin registrar'),
      fecha: formatearFechaReporte(hallazgo.h_fecha ?? hallazgo.H_Fecha),
      imagen: obtenerImagenMascota(hallazgo.h_imagen ?? hallazgo.H_Imagen),
      estado: obtenerEstadoHallazgo(estado),
      estadoClase: obtenerClaseEstado(estado),
      publicadoPor: obtenerTextoReporte(
        hallazgo.usuario_nombre ??
        hallazgo.u_nombre ??
        hallazgo.nombre ??
        hallazgo.Nombre ??
        hallazgo.usuario_id ??
        hallazgo.u_id,
        'Usuario no informado'
      ),
      ubicacion: null
    };
  }

  private cargarUbicacionReporte(id: string) {
    this.geolocalizacionService.obtenerUbicacionReporte('HALLAZGO', id)
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
