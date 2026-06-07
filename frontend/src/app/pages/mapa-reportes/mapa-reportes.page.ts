import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locateOutline, mapOutline, pawOutline, refreshOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { GeolocalizacionService } from '../../services/geolocalizacion.service';

interface UbicacionReporteMapa {
  id: string;
  tipoReporte: 'PERDIDA' | 'HALLAZGO';
  reporteId: string;
  direccion: string;
  comuna: string;
  region: string;
  latitud: number;
  longitud: number;
  distanciaKm: number | null;
}

@Component({
  selector: 'app-mapa-reportes',
  templateUrl: './mapa-reportes.page.html',
  styleUrls: ['./mapa-reportes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MapaReportesPage implements AfterViewInit, OnDestroy {
  @ViewChild('mapaReportes') mapaReportes?: ElementRef<HTMLDivElement>;

  ubicaciones: UbicacionReporteMapa[] = [];
  cargando = false;
  error = '';
  radioKm = 5;
  ubicacionUsuario: { latitud: number; longitud: number } | null = null;

  private mapa?: L.Map;
  private marcadorUsuario?: L.Marker;
  private marcadoresReportes: L.Marker[] = [];

  constructor(
    private geolocalizacionService: GeolocalizacionService,
    private router: Router
  ) {
    addIcons({ locateOutline, mapOutline, pawOutline, refreshOutline });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
      this.cargarMapa();
    }, 250);
  }

  ngOnDestroy() {
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  cambiarRadio(radioKm: number) {
    this.radioKm = radioKm;
    this.cargarReportesCercanos();
  }

  cargarMapa() {
    this.cargando = true;
    this.error = '';

    this.obtenerUbicacionActual()
      .then((ubicacion) => {
        this.ubicacionUsuario = ubicacion;
        this.actualizarMarcadorUsuario(ubicacion.latitud, ubicacion.longitud);
        this.cargarReportesCercanos();
      })
      .catch(() => {
        this.cargando = false;
        this.error = 'No se pudo obtener tu ubicación. Activa los permisos para ver reportes cercanos.';
      });
  }

  verDetalle(ubicacion: UbicacionReporteMapa) {
    const ruta = ubicacion.tipoReporte === 'PERDIDA' ? '/mascota-perdida' : '/mascota-hallada';
    this.router.navigate([ruta, ubicacion.reporteId]);
  }

  private cargarReportesCercanos() {
    if (!this.ubicacionUsuario) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.geolocalizacionService.listarUbicacionesCercanas({
      latitud: this.ubicacionUsuario.latitud,
      longitud: this.ubicacionUsuario.longitud,
      radioKm: this.radioKm,
      limite: 100
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;
          const items = Array.isArray(data) ? data : data?.items || [];
          this.ubicaciones = items
            .map((item: any) => this.normalizarUbicacion(item))
            .filter((item: UbicacionReporteMapa | null): item is UbicacionReporteMapa => item !== null);
          this.pintarReportes();
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.ubicaciones = [];
          this.limpiarMarcadoresReportes();
        }
      });
  }

  private inicializarMapa() {
    if (!this.mapaReportes || this.mapa) {
      return;
    }

    const centroInicial: L.LatLngExpression = [-33.4489, -70.6693];

    this.mapa = L.map(this.mapaReportes.nativeElement, {
      center: centroInicial,
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.mapa);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 300);
  }

  private actualizarMarcadorUsuario(latitud: number, longitud: number) {
    const posicion: L.LatLngExpression = [latitud, longitud];

    if (!this.mapa) {
      return;
    }

    if (!this.marcadorUsuario) {
      this.marcadorUsuario = L.marker(posicion, {
        icon: this.crearIcono('usuario')
      }).addTo(this.mapa);
    }

    this.marcadorUsuario.setLatLng(posicion);
    this.mapa.setView(posicion, 14);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 100);
  }

  private pintarReportes() {
    if (!this.mapa) {
      return;
    }

    this.limpiarMarcadoresReportes();

    this.ubicaciones.forEach((ubicacion) => {
      const marcador = L.marker([ubicacion.latitud, ubicacion.longitud], {
        icon: this.crearIcono(ubicacion.tipoReporte)
      }).addTo(this.mapa as L.Map);

      marcador.bindPopup(this.crearPopup(ubicacion));
      this.marcadoresReportes.push(marcador);
    });
  }

  private limpiarMarcadoresReportes() {
    this.marcadoresReportes.forEach((marcador) => marcador.remove());
    this.marcadoresReportes = [];
  }

  private crearIcono(tipo: 'usuario' | 'PERDIDA' | 'HALLAZGO') {
    return L.divIcon({
      className: `pin-mapa pin-${tipo.toLowerCase()}`,
      html: '<span></span>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  private crearPopup(ubicacion: UbicacionReporteMapa) {
    const contenedor = document.createElement('div');
    const tipo = document.createElement('strong');
    const direccion = document.createElement('p');
    const zona = document.createElement('p');
    const boton = document.createElement('button');

    contenedor.className = 'popup-reporte';
    tipo.textContent = ubicacion.tipoReporte === 'PERDIDA' ? 'Mascota perdida' : 'Mascota hallada';
    direccion.textContent = ubicacion.direccion;
    zona.textContent = `${ubicacion.comuna}, ${ubicacion.region}`;
    boton.type = 'button';
    boton.textContent = 'Ver detalle';
    boton.addEventListener('click', () => this.verDetalle(ubicacion));

    contenedor.appendChild(tipo);
    contenedor.appendChild(direccion);
    contenedor.appendChild(zona);

    if (ubicacion.distanciaKm !== null) {
      const distancia = document.createElement('p');
      distancia.textContent = `${ubicacion.distanciaKm.toFixed(2)} km de distancia`;
      contenedor.appendChild(distancia);
    }

    contenedor.appendChild(boton);

    return contenedor;
  }

  private normalizarUbicacion(item: any): UbicacionReporteMapa | null {
    const latitud = Number(item.latitud ?? item.geo_latitud);
    const longitud = Number(item.longitud ?? item.geo_longitud);
    const tipoReporte = String(item.tipoReporte ?? item.tipo_reporte ?? '').toUpperCase();

    if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
      return null;
    }

    if (tipoReporte !== 'PERDIDA' && tipoReporte !== 'HALLAZGO') {
      return null;
    }

    const distancia = item.distanciaKm ?? item.distancia_km;
    const distanciaKm = distancia === null || distancia === undefined ? null : Number(distancia);

    return {
      id: String(item.geo_id ?? item.id ?? `${tipoReporte}-${item.reporteId ?? item.reporte_id}`),
      tipoReporte,
      reporteId: String(item.reporteId ?? item.reporte_id ?? ''),
      direccion: String(item.direccion ?? item.geo_direccion ?? 'Dirección sin registrar'),
      comuna: String(item.comuna ?? item.geo_comuna ?? 'Comuna sin registrar'),
      region: String(item.region ?? item.geo_region ?? 'Región sin registrar'),
      latitud,
      longitud,
      distanciaKm: Number.isFinite(distanciaKm) ? distanciaKm : null
    };
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
      throw new Error('Geolocalización no disponible');
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

  private obtenerMensajeError(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudieron cargar los reportes cercanos';
  }
}
