import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerdidaService {
  private apiUrl = `${environment.apiUrl}/perdidas`;

  constructor(private http: HttpClient) {}

  crearPerdida(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  listarPerdidas(filtros: any = {}): Observable<any> {
    const params = this.crearParametros(filtros);
    return this.http.get(this.apiUrl, { params });
  }

  obtenerPerdida(idPerdida: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idPerdida}`);
  }

  actualizarPerdida(idPerdida: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idPerdida}`, data);
  }

  cambiarEstado(idPerdida: string, estado: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idPerdida}/estado`, { estado });
  }

  private crearParametros(filtros: any): HttpParams {
    let params = new HttpParams();

    Object.keys(filtros).forEach((key) => {
      const valor = filtros[key];

      if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
        params = params.set(key, valor);
      }
    });

    return params;
  }
}
