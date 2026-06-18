import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token } from '@capacitor/push-notifications';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SesionService } from './sesion.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.apiUrl}/notificaciones`;
  private tokenStorageKey = 'push_token';
  private listenersConfigurados = false;
  private inicializando = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone,
    private sesionService: SesionService
  ) {}

  async inicializarPush() {
    if (this.inicializando || !this.sesionService.sesionActiva()) {
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    this.inicializando = true;

    try {
      await this.configurarListeners();

      const permisosActuales = await PushNotifications.checkPermissions();
      let permiso = permisosActuales.receive;

      if (permiso === 'prompt') {
        const permisosSolicitados = await PushNotifications.requestPermissions();
        permiso = permisosSolicitados.receive;
      }

      if (permiso !== 'granted') {
        return;
      }

      await PushNotifications.register();
    } finally {
      this.inicializando = false;
    }
  }

  registrarDispositivo(token: string): Observable<any> {
    localStorage.setItem(this.tokenStorageKey, token);

    return this.http.post(`${this.apiUrl}/dispositivos`, {
      token,
      plataforma: 'ANDROID'
    });
  }

  async desactivarDispositivoActual() {
    const token = localStorage.getItem(this.tokenStorageKey);

    if (!token || !this.sesionService.sesionActiva()) {
      localStorage.removeItem(this.tokenStorageKey);
      return;
    }

    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/dispositivos/desactivar`, {
          token
        })
      );
    } catch {
    } finally {
      localStorage.removeItem(this.tokenStorageKey);
    }
  }

  listarNotificaciones(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  marcarLeida(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/leida`, {});
  }

  enviarPrueba(): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-prueba`, {
      titulo: 'Sanos y Salvos',
      cuerpo: 'Notificacion de prueba'
    });
  }

  private async configurarListeners() {
    if (this.listenersConfigurados) {
      return;
    }

    await PushNotifications.addListener('registration', (token: Token) => {
      this.registrarDispositivo(token.value).subscribe();
    });

    await PushNotifications.addListener('registrationError', (error) => {
      console.error('No se pudo registrar el dispositivo para push', error);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (evento) => {
      const data = evento.notification.data || {};
      const conversacionId = data.conversacionId;
      const hallazgoId = data.hallazgoId;

      this.zone.run(() => {
        if (conversacionId) {
          this.router.navigate(['/mensajes', conversacionId]);
          return;
        }

        if (hallazgoId) {
          this.router.navigate(['/mascota-hallada', hallazgoId]);
          return;
        }

        this.router.navigate(['/principal']);
      });
    });

    this.listenersConfigurados = true;
  }
}
