import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaSocketService {
  private socket?: Socket;
  private socketUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  conectar(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      path: '/api/mensajeria/socket.io',
      auth: { token },
      transports: ['websocket', 'polling']
    });
  }

  unirseConversacion(conversacionId: string) {
    this.socket?.emit('conversacion:unirse', { convId: conversacionId });
  }

  salirConversacion(conversacionId: string) {
    this.socket?.emit('conversacion:salir', { convId: conversacionId });
  }

  escucharMensajeNuevo(): Observable<any> {
    return new Observable((observer) => {
      const manejador = (mensaje: any) => observer.next(mensaje);

      this.socket?.on('mensaje:nuevo', manejador);

      return () => {
        this.socket?.off('mensaje:nuevo', manejador);
      };
    });
  }

  desconectar() {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
