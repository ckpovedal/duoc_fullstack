import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, heartOutline, pawOutline } from 'ionicons/icons';
import { finalize, timeout } from 'rxjs';
import { PerdidaService } from '../../services/perdida.service';
import { SesionService } from '../../services/sesion.service';
import {
  obtenerImagenMascota,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface PerdidaCarruselVista {
  id: string;
  nombre: string;
  tipo: string;
  comuna: string;
  imagen: string;
  fecha: string;
}

const CANTIDAD_CARRUSEL = 8;
const ESTADO_ACTIVO = '1';
const INTERVALO_AUTOPLAY_MS = 4000;

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class PrincipalPage implements OnInit, OnDestroy {

  nombreUsuario = '';
  estaLogueado = false;

  perdidasRecientes: PerdidaCarruselVista[] = [];
  cargandoPerdidas = false;
  errorPerdidas = '';
  indiceCarrusel = 0;

  private autoplayIntervalo?: ReturnType<typeof setInterval>;
  private autoplayPausado = false;

  constructor(
    private router: Router,
    private perdidaService: PerdidaService,
    private sesionService: SesionService
  ) {
    addIcons({ heartOutline, pawOutline, chevronBackOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.estaLogueado = this.sesionService.sesionActiva();
    this.nombreUsuario = this.estaLogueado ? this.sesionService.obtenerNombreUsuario() : '';
    this.cargarPerdidasRecientes();
  }

  ngOnDestroy() {
    this.detenerAutoplay();
  }

  irDonativos() {
    this.router.navigate(['/donativos']);
  }

  irAlReporte(perdida: PerdidaCarruselVista) {
    this.router.navigate(['/mascota-perdida', perdida.id]);
  }

  irACarrusel(indice: number) {
    this.indiceCarrusel = indice;
  }

  anteriorCarrusel() {
    if (!this.perdidasRecientes.length) {
      return;
    }

    this.indiceCarrusel = (this.indiceCarrusel - 1 + this.perdidasRecientes.length) % this.perdidasRecientes.length;
  }

  siguienteCarrusel() {
    if (!this.perdidasRecientes.length) {
      return;
    }

    this.indiceCarrusel = (this.indiceCarrusel + 1) % this.perdidasRecientes.length;
  }

  pausarAutoplay() {
    this.autoplayPausado = true;
  }

  reanudarAutoplay() {
    this.autoplayPausado = false;
  }

  private cargarPerdidasRecientes() {
    this.cargandoPerdidas = true;
    this.errorPerdidas = '';

    this.perdidaService.listarPerdidas()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargandoPerdidas = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const lista = respuesta?.respuesta || respuesta?.data || respuesta;
          this.perdidasRecientes = this.normalizarYFiltrarPerdidas(Array.isArray(lista) ? lista : []);
          this.indiceCarrusel = 0;
          this.iniciarAutoplay();
        },
        error: () => {
          this.errorPerdidas = 'No se pudieron cargar los reportes recientes';
          this.perdidasRecientes = [];
        }
      });
  }

  private normalizarYFiltrarPerdidas(lista: any[]): PerdidaCarruselVista[] {
    return lista
      .filter((perdida) => String(perdida.p_estado ?? perdida.P_Estado) === ESTADO_ACTIVO)
      .sort((a, b) => this.obtenerFechaOrden(b) - this.obtenerFechaOrden(a))
      .slice(0, CANTIDAD_CARRUSEL)
      .map((perdida) => ({
        id: obtenerTextoReporte(perdida.p_id ?? perdida.P_ID, ''),
        nombre: obtenerTextoReporte(perdida.p_nom_masc ?? perdida.P_Nom_Masc, 'Mascota perdida'),
        tipo: obtenerTipoMascota(perdida.p_tipo ?? perdida.P_Tipo),
        comuna: obtenerTextoReporte(perdida.p_comuna ?? perdida.P_Comuna, 'Sin comuna'),
        imagen: obtenerImagenMascota(perdida.p_imagen ?? perdida.P_Imagen),
        fecha: obtenerTextoReporte(perdida.p_fecha ?? perdida.P_Fecha, '')
      }));
  }

  private obtenerFechaOrden(perdida: any): number {
    const fecha = perdida.p_fecha ?? perdida.P_Fecha;
    const tiempo = fecha ? new Date(fecha).getTime() : 0;
    return Number.isFinite(tiempo) ? tiempo : 0;
  }

  private iniciarAutoplay() {
    this.detenerAutoplay();

    if (this.perdidasRecientes.length <= 1) {
      return;
    }

    this.autoplayIntervalo = setInterval(() => {
      if (this.autoplayPausado) {
        return;
      }

      this.siguienteCarrusel();
    }, INTERVALO_AUTOPLAY_MS);
  }

  private detenerAutoplay() {
    if (this.autoplayIntervalo) {
      clearInterval(this.autoplayIntervalo);
      this.autoplayIntervalo = undefined;
    }
  }
}