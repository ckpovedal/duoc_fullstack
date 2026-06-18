import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, forkJoin, map, Observable, of, switchMap, timeout } from 'rxjs';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbleEllipsesOutline, chevronForwardOutline, mailOutline } from 'ionicons/icons';
import { MensajeriaService } from '../../services/mensajeria.service';
import { SesionService } from '../../services/sesion.service';
import { UsuarioService } from '../../services/usuario.service';

interface ConversacionVista {
  id: string;
  contactoNombre: string;
  tipoReporte: string;
  ultimoMensaje: string;
  fechaTexto: string;
  noLeidos: number;
}

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MensajesPage implements OnInit {
  conversaciones: ConversacionVista[] = [];
  cargando = false;
  error = '';

  constructor(
    private mensajeriaService: MensajeriaService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    addIcons({ chatbubbleEllipsesOutline, chevronForwardOutline, mailOutline });
  }

  ngOnInit() {
    this.cargarConversaciones();
  }

  ionViewWillEnter() {
    this.cargarConversaciones();
  }

  cargarConversaciones() {
    const usuarioId = this.sesionService.obtenerUsuarioId();

    if (!usuarioId) {
      this.error = 'No se encontró la sesión del usuario';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.mensajeriaService.listarConversacionesUsuario(usuarioId)
      .pipe(
        timeout(10000),
        switchMap((respuesta): Observable<ConversacionVista[]> => {
          const conversaciones = Array.isArray(respuesta?.respuesta)
            ? respuesta.respuesta
            : Array.isArray(respuesta?.data)
              ? respuesta.data
              : Array.isArray(respuesta)
                ? respuesta
                : [];

          if (conversaciones.length === 0) {
            return of([] as ConversacionVista[]);
          }

          const solicitudes: Observable<ConversacionVista>[] = conversaciones.map((conversacion: any) =>
            this.crearConversacionVista(conversacion, usuarioId)
          );

          return forkJoin(solicitudes);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (conversaciones) => {
          this.conversaciones = conversaciones;
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.conversaciones = [];
        }
      });
  }

  abrirConversacion(conversacion: ConversacionVista) {
    this.router.navigate(['/mensajes', conversacion.id]);
  }

  private crearConversacionVista(conversacion: any, usuarioId: string): Observable<ConversacionVista> {
    const conversacionId = conversacion.conv_id ?? conversacion.CONV_ID;
    const duenoId = conversacion.u_id_dueno ?? conversacion.U_ID_DUENO;
    const contactoId = conversacion.u_id_contacto ?? conversacion.U_ID_CONTACTO;
    const otroUsuarioId = usuarioId === duenoId ? contactoId : duenoId;

    return this.usuarioService.obtenerContacto(otroUsuarioId)
      .pipe(
        timeout(10000),
        map((respuesta) => {
          const usuario = respuesta?.respuesta || respuesta?.data || respuesta;

          return {
            id: conversacionId,
            contactoNombre: this.obtenerNombreUsuario(usuario),
            tipoReporte: this.obtenerTipoReporte(conversacion.tipo_reporte ?? conversacion.TIPO_REPORTE),
            ultimoMensaje: this.obtenerUltimoMensaje(conversacion.ultimo_mensaje),
            fechaTexto: this.formatearFecha(conversacion.ultimo_mensaje_fecha ?? conversacion.conv_fecha ?? conversacion.CONV_FECHA),
            noLeidos: Number(conversacion.mensajes_no_leidos || 0)
          };
        })
      );
  }

  private obtenerNombreUsuario(usuario: any) {
    return usuario?.nombre || usuario?.u_nombre || usuario?.U_Nombre || 'Contacto';
  }

  private obtenerTipoReporte(tipo: string) {
    return String(tipo).toUpperCase() === 'HALLAZGO'
      ? 'Mascota hallada'
      : 'Mascota perdida';
  }

  private obtenerUltimoMensaje(mensaje: string | null | undefined) {
    const texto = String(mensaje || '').trim();

    if (!texto) {
      return 'Conversación iniciada';
    }

    return texto.length > 80 ? `${texto.slice(0, 77)}...` : texto;
  }

  private formatearFecha(fecha: string | null | undefined) {
    if (!fecha) {
      return '';
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return '';
    }

    const hoy = new Date();
    const mismoDia = valor.toDateString() === hoy.toDateString();

    if (mismoDia) {
      return valor.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return valor.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  private obtenerMensajeError(error: any) {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudieron cargar tus mensajes';
  }
}
