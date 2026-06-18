import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription, timeout } from 'rxjs';
import { IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, paperPlaneOutline } from 'ionicons/icons';
import { MensajeriaService } from '../../services/mensajeria.service';
import { MensajeriaSocketService } from '../../services/mensajeria-socket.service';
import { MensajeriaEstadoService } from '../../services/mensajeria-estado.service';
import { SesionService } from '../../services/sesion.service';

interface MensajeVista {
  id: string;
  contenido: string;
  fecha: string;
  propio: boolean;
  leido: boolean;
}

@Component({
  selector: 'app-conversacion',
  templateUrl: './conversacion.page.html',
  styleUrls: ['./conversacion.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonInput, CommonModule, FormsModule]
})
export class ConversacionPage implements OnInit, OnDestroy {
  @ViewChild('contenedorMensajes') contenedorMensajes?: ElementRef<HTMLDivElement>;

  conversacionId = '';
  usuarioId = '';
  mensajes: MensajeVista[] = [];
  nuevoMensaje = '';
  cargando = false;
  enviando = false;
  error = '';
  private mensajesSocketSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mensajeriaService: MensajeriaService,
    private mensajeriaSocketService: MensajeriaSocketService,
    private mensajeriaEstadoService: MensajeriaEstadoService,
    private sesionService: SesionService
  ) {
    addIcons({ chevronBackOutline, paperPlaneOutline });
  }

  ngOnInit() {
    this.conversacionId = this.route.snapshot.paramMap.get('id') || '';
    this.usuarioId = this.sesionService.obtenerUsuarioId();

    if (!this.conversacionId || !this.usuarioId) {
      this.error = 'No se pudo abrir la conversación';
      return;
    }

    this.cargarMensajes();
    this.conectarSocket();
  }

  ngOnDestroy() {
    if (this.conversacionId) {
      this.mensajeriaSocketService.salirConversacion(this.conversacionId);
    }

    this.mensajesSocketSubscription?.unsubscribe();
    this.mensajeriaSocketService.desconectar();
  }

  volver() {
    this.router.navigate(['/mensajes']);
  }

  cargarMensajes() {
    this.cargando = true;
    this.error = '';

    this.mensajeriaService.listarMensajesConversacion(this.conversacionId)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const mensajes = Array.isArray(respuesta?.respuesta)
            ? respuesta.respuesta
            : Array.isArray(respuesta?.data)
              ? respuesta.data
              : Array.isArray(respuesta)
                ? respuesta
                : [];

          this.mensajes = mensajes.map((mensaje: any) => this.normalizarMensaje(mensaje));
          this.marcarRecibidosComoLeidos();
          this.bajarAlFinal();
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mensajes = [];
        }
      });
  }

  enviarMensaje() {
    const contenido = this.nuevoMensaje.trim();

    if (!contenido || this.enviando) {
      return;
    }

    this.enviando = true;
    this.error = '';

    this.mensajeriaService.enviarMensaje({
      convId: this.conversacionId,
      uIdEmisor: this.usuarioId,
      msgContenido: contenido
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.enviando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const mensaje = respuesta?.respuesta || respuesta?.data || respuesta;

          this.nuevoMensaje = '';
          this.agregarMensajeSiNoExiste(mensaje);
          this.bajarAlFinal();
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
        }
      });
  }

  private conectarSocket() {
    const token = this.sesionService.obtenerToken();

    if (!token) {
      return;
    }

    this.mensajeriaSocketService.conectar(token);
    this.mensajeriaSocketService.unirseConversacion(this.conversacionId);

    this.mensajesSocketSubscription = this.mensajeriaSocketService
      .escucharMensajeNuevo()
      .subscribe((mensaje) => {
        const convId = String(mensaje?.conv_id ?? mensaje?.CONV_ID ?? '');

        if (convId !== this.conversacionId) {
          return;
        }

        this.agregarMensajeSiNoExiste(mensaje);
        this.marcarRecibidosComoLeidos();
        this.bajarAlFinal();
      });
  }

  private agregarMensajeSiNoExiste(mensaje: any) {
    const mensajeNormalizado = this.normalizarMensaje(mensaje);

    if (!mensajeNormalizado.id) {
      return;
    }

    const existe = this.mensajes.some((item) => item.id === mensajeNormalizado.id);

    if (existe) {
      return;
    }

    this.mensajes = [
      ...this.mensajes,
      mensajeNormalizado
    ];
  }

  private normalizarMensaje(mensaje: any): MensajeVista {
    const id = String(mensaje?.msg_id ?? mensaje?.MSG_ID ?? '');
    const contenido = mensaje?.msg_contenido ?? mensaje?.MSG_CONTENIDO ?? '';
    const fecha = mensaje?.msg_fecha ?? mensaje?.MSG_FECHA;
    const emisor = String(mensaje?.u_id_emisor ?? mensaje?.U_ID_EMISOR ?? '');
    const leido = Number(mensaje?.msg_leido ?? mensaje?.MSG_LEIDO) === 1;

    return {
      id,
      contenido,
      fecha: this.formatearFecha(fecha),
      propio: emisor === this.usuarioId,
      leido
    };
  }

  private marcarRecibidosComoLeidos() {
    const pendientes = this.mensajes.filter((mensaje) => mensaje.id && !mensaje.propio && !mensaje.leido);

    pendientes.forEach((mensaje) => {
      this.mensajeriaService.marcarMensajeLeido(mensaje.id).subscribe({
        next: () => {
          mensaje.leido = true;
          this.mensajeriaEstadoService.notificarMensajesLeidos();
        }
      });
    });
  }

  private bajarAlFinal() {
    setTimeout(() => {
      const contenedor = this.contenedorMensajes?.nativeElement;

      if (contenedor) {
        contenedor.scrollTop = contenedor.scrollHeight;
      }
    }, 100);
  }

  private formatearFecha(fecha: string | null | undefined) {
    if (!fecha) {
      return '';
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return '';
    }

    return valor.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private obtenerMensajeError(error: any) {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudo cargar la conversación';
  }
}
