import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  listarUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerUsuario(idUsuario: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idUsuario}`);
  }

  actualizarUsuario(idUsuario: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idUsuario}`, data);
  }
}
