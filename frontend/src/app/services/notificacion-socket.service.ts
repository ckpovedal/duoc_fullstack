import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionSocketService {
  private socket?: Socket;
  private socketUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  conectar(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      path: '/api/notificaciones/socket.io',
      auth: { token },
      transports: ['websocket', 'polling']
    });
  }

  escucharNotificacionNueva(): Observable<any> {
    return new Observable((observer) => {
      const manejador = (notificacion: any) => observer.next(notificacion);

      this.socket?.on('notificacion:nueva', manejador);

      return () => {
        this.socket?.off('notificacion:nueva', manejador);
      };
    });
  }

  escucharNotificacionLeida(): Observable<any> {
    return new Observable((observer) => {
      const manejador = (notificacion: any) => observer.next(notificacion);

      this.socket?.on('notificacion:leida', manejador);

      return () => {
        this.socket?.off('notificacion:leida', manejador);
      };
    });
  }

  desconectar() {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
