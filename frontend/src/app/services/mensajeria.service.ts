import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CrearConversacionRequest {
  tipoReporte: 'PERDIDA' | 'HALLAZGO';
  reporteId: string;
  uIdDueno: string;
  uIdContacto: string;
}

export interface EnviarMensajeRequest {
  convId: string;
  uIdEmisor: string;
  msgContenido: string;
}

@Injectable({
  providedIn: 'root'
})
export class MensajeriaService {
  private apiUrl = `${environment.apiUrl}/mensajeria`;

  constructor(private http: HttpClient) {}

  crearConversacion(data: CrearConversacionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversaciones`, data);
  }

  listarConversacionesUsuario(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversaciones/usuario/${usuarioId}`);
  }

  listarMensajesConversacion(conversacionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversaciones/${conversacionId}/mensajes`);
  }

  enviarMensaje(data: EnviarMensajeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/mensajes`, data);
  }

  marcarMensajeLeido(mensajeId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/mensajes/${mensajeId}/leido`, null);
  }
}
