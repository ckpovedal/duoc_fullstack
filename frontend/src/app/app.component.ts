import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { addCircle, chatbubbleEllipsesOutline, homeOutline, logInOutline, logOutOutline, mapOutline, notificationsOutline, pawOutline, personAddOutline, personCircleOutline, searchOutline} from 'ionicons/icons';
import { Subscription, timeout } from 'rxjs';
import { SesionService } from './services/sesion.service';
import { NotificacionService } from './services/notificacion.service';
import { NotificacionSocketService } from './services/notificacion-socket.service';
import { MensajeriaService } from './services/mensajeria.service';
import { MensajeriaEstadoService } from './services/mensajeria-estado.service';

interface NotificacionNavbar {
  id: string;
  titulo: string;
  cuerpo: string;
  tipo: string;
  tiempoTexto: string;
  leida: boolean;
  hallazgoId: string;
  conversacionId: string;
  nivel: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp,
    IonIcon,
    IonRouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
})

export class AppComponent implements OnDestroy {

  estaLogueado = false;
  notificacionesNoLeidas = 0;
  mensajesNoLeidos = 0;
  panelNotificacionesAbierto = false;
  notificacionesNavbar: NotificacionNavbar[] = [];
  private notificacionNuevaSubscription?: Subscription;
  private notificacionLeidaSubscription?: Subscription;
  private mensajesLeidosSubscription?: Subscription;

  constructor(
    private titleService: Title,
    private router: Router,
    private sesionService: SesionService,
    private notificacionService: NotificacionService,
    private notificacionSocketService: NotificacionSocketService,
    private mensajeriaService: MensajeriaService,
    private mensajeriaEstadoService: MensajeriaEstadoService
  ) {
    this.titleService.setTitle('Sanos y Salvos');
    addIcons({ addCircle, chatbubbleEllipsesOutline, homeOutline, logInOutline, logOutOutline, mapOutline, notificationsOutline, pawOutline, personAddOutline, personCircleOutline, searchOutline});
    this.validarSesion();
    this.cargarBadgeNotificaciones();
    this.cargarBadgeMensajes();
    this.configurarSocketNotificaciones();
    this.configurarEstadoMensajeria();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.validarSesion();
        this.cargarBadgeNotificaciones();
        this.cargarBadgeMensajes();
        this.configurarSocketNotificaciones();
        this.panelNotificacionesAbierto = false;
      }
    });
  }

  validarSesion() {
    this.estaLogueado = this.sesionService.sesionActiva();

    if (!this.estaLogueado) {
      this.notificacionesNoLeidas = 0;
      this.mensajesNoLeidos = 0;
      this.notificacionesNavbar = [];
      this.panelNotificacionesAbierto = false;
      this.desconectarSocketNotificaciones();
    }
  }

  cargarBadgeNotificaciones() {
    if (!this.sesionService.sesionActiva()) {
      this.notificacionesNoLeidas = 0;
      return;
    }

    this.notificacionService.listarNotificaciones()
      .pipe(timeout(10000))
      .subscribe({
        next: (respuesta) => {
          const notificaciones = Array.isArray(respuesta?.respuesta)
            ? respuesta.respuesta
            : Array.isArray(respuesta?.data)
              ? respuesta.data
              : Array.isArray(respuesta)
                ? respuesta
                : [];

          const normalizadas = notificaciones.map((notificacion: any) =>
            this.normalizarNotificacionNavbar(notificacion)
          ).filter((notificacion: NotificacionNavbar) => notificacion.tipo !== 'MENSAJE');

          this.notificacionesNavbar = normalizadas.slice(0, 8);
          this.notificacionesNoLeidas = normalizadas.filter((notificacion: NotificacionNavbar) =>
            !notificacion.leida
          ).length;
        },
        error: () => {
          this.notificacionesNoLeidas = 0;
          this.notificacionesNavbar = [];
        }
      });
  }

  cargarBadgeMensajes() {
    if (!this.sesionService.sesionActiva()) {
      this.mensajesNoLeidos = 0;
      return;
    }

    const usuarioId = this.sesionService.obtenerUsuarioId();

    if (!usuarioId) {
      this.mensajesNoLeidos = 0;
      return;
    }

    this.mensajeriaService.listarConversacionesUsuario(usuarioId)
      .pipe(timeout(10000))
      .subscribe({
        next: (respuesta) => {
          const conversaciones = Array.isArray(respuesta?.respuesta)
            ? respuesta.respuesta
            : Array.isArray(respuesta?.data)
              ? respuesta.data
              : Array.isArray(respuesta)
                ? respuesta
                : [];

          this.mensajesNoLeidos = conversaciones.reduce((total: number, conversacion: any) =>
            total + Number(conversacion.mensajes_no_leidos || conversacion.MENSAJES_NO_LEIDOS || 0), 0);
        },
        error: () => {
          this.mensajesNoLeidos = 0;
        }
      });
  }

  logout() {
    this.notificacionService.desactivarDispositivoActual().finally(() => {
      this.desconectarSocketNotificaciones();
      this.sesionService.cerrarSesion();
      this.estaLogueado = false;
      this.notificacionesNoLeidas = 0;
      this.mensajesNoLeidos = 0;
      this.notificacionesNavbar = [];
      this.panelNotificacionesAbierto = false;
      this.router.navigate(['/inicio']);
    });
  }

  alternarPanelNotificaciones() {
    this.panelNotificacionesAbierto = !this.panelNotificacionesAbierto;

    if (this.panelNotificacionesAbierto) {
      this.cargarBadgeNotificaciones();
    }
  }

  abrirNotificacionNavbar(notificacion: NotificacionNavbar) {
    const navegar = () => {
      this.panelNotificacionesAbierto = false;

      if (notificacion.conversacionId) {
        this.router.navigate(['/mensajes', notificacion.conversacionId]);
        return;
      }

      if (notificacion.hallazgoId) {
        this.router.navigate(['/mascota-hallada', notificacion.hallazgoId]);
        return;
      }

      this.cargarBadgeNotificaciones();
    };

    if (notificacion.leida || !notificacion.id) {
      navegar();
      return;
    }

    this.notificacionService.marcarLeida(notificacion.id)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          notificacion.leida = true;
          this.cargarBadgeNotificaciones();
          navegar();
        },
        error: () => {
          navegar();
        }
      });
  }

  iconoNotificacionNavbar(notificacion: NotificacionNavbar) {
    if (notificacion.tipo === 'MENSAJE') {
      return 'chatbubble-ellipses-outline';
    }

    if (notificacion.tipo === 'COINCIDENCIA') {
      return 'paw-outline';
    }

    return 'notifications-outline';
  }

  configurarSocketNotificaciones() {
    const token = this.sesionService.obtenerToken();

    if (!this.sesionService.sesionActiva() || !token) {
      this.desconectarSocketNotificaciones();
      return;
    }

    this.notificacionSocketService.conectar(token);

    if (!this.notificacionNuevaSubscription) {
      this.notificacionNuevaSubscription = this.notificacionSocketService
        .escucharNotificacionNueva()
        .subscribe((notificacion) => {
          const tipo = String(notificacion?.not_tipo ?? notificacion?.NOT_TIPO ?? '').toUpperCase();

          if (tipo === 'MENSAJE') {
            this.cargarBadgeMensajes();
            return;
          }

          this.cargarBadgeNotificaciones();
        });
    }

    if (!this.notificacionLeidaSubscription) {
      this.notificacionLeidaSubscription = this.notificacionSocketService
        .escucharNotificacionLeida()
        .subscribe((notificacion) => {
          const tipo = String(notificacion?.not_tipo ?? notificacion?.NOT_TIPO ?? '').toUpperCase();

          if (tipo === 'MENSAJE') {
            this.cargarBadgeMensajes();
            return;
          }

          this.cargarBadgeNotificaciones();
        });
    }
  }

  desconectarSocketNotificaciones() {
    this.notificacionNuevaSubscription?.unsubscribe();
    this.notificacionLeidaSubscription?.unsubscribe();
    this.notificacionNuevaSubscription = undefined;
    this.notificacionLeidaSubscription = undefined;
    this.notificacionSocketService.desconectar();
  }

  ngOnDestroy() {
    this.desconectarSocketNotificaciones();
    this.mensajesLeidosSubscription?.unsubscribe();
  }

  private configurarEstadoMensajeria() {
    if (this.mensajesLeidosSubscription) {
      return;
    }

    this.mensajesLeidosSubscription = this.mensajeriaEstadoService.mensajesLeidos$
      .subscribe(() => {
        this.cargarBadgeMensajes();
      });
  }

  private normalizarNotificacionNavbar(notificacion: any): NotificacionNavbar {
    const data = this.obtenerDataNotificacion(notificacion.not_data ?? notificacion.NOT_DATA);
    const fecha = this.obtenerFechaNotificacion(notificacion.not_fecha ?? notificacion.NOT_FECHA);

    return {
      id: String(notificacion.not_id ?? notificacion.NOT_ID ?? ''),
      titulo: String(notificacion.not_titulo ?? notificacion.NOT_TITULO ?? 'Notificacion'),
      cuerpo: String(notificacion.not_cuerpo ?? notificacion.NOT_CUERPO ?? ''),
      tipo: String(notificacion.not_tipo ?? notificacion.NOT_TIPO ?? '').toUpperCase(),
      tiempoTexto: this.formatearTiempoRelativo(fecha),
      leida: Number(notificacion.not_leida ?? notificacion.NOT_LEIDA) === 1,
      hallazgoId: String(data.hallazgoId ?? data.hallazgo_id ?? ''),
      conversacionId: String(data.conversacionId ?? data.conversacion_id ?? ''),
      nivel: String(data.nivel ?? '')
    };
  }

  private obtenerDataNotificacion(data: any) {
    if (!data) {
      return {};
    }

    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    }

    return data;
  }

  private obtenerFechaNotificacion(fecha: string | null | undefined) {
    if (!fecha) {
      return null;
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return null;
    }

    return valor;
  }

  private formatearTiempoRelativo(fecha: Date | null) {
    if (!fecha) {
      return '';
    }

    const diferenciaMs = Date.now() - fecha.getTime();
    const minutos = Math.floor(diferenciaMs / (1000 * 60));
    const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(dias / 7);

    if (minutos < 1) {
      return 'Ahora';
    }

    if (minutos < 60) {
      return `${minutos} min`;
    }

    if (horas < 24) {
      return `${horas} h`;
    }

    if (dias < 7) {
      return `${dias} dias`;
    }

    return `${semanas} sem`;
  }

  mostrarNavbar(): boolean {
    return this.router.url !== '/' && !this.router.url.startsWith('/inicio');
  }

  mostrarMenuMovil(): boolean {
    const rutasConMenu = [
      '/principal',
      '/buscador',
      '/mapa',
      '/reporte-mascota',
      '/mascotas-halladas',
      '/hallazgos',
      '/mascota-perdida',
      '/mascota-hallada',
      '/mensajes',
      '/mi-perfil'
    ];

    return rutasConMenu.some((ruta) =>
      this.router.url.startsWith(ruta)
    );
  }
}
