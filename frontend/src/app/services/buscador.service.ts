import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuscadorService {
  private apiUrl = `${environment.apiUrl}/buscador`;

  constructor(private http: HttpClient) {}

  buscarPorPerdida(idPerdida: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idPerdida}`);
  }

  buscarPorParametros(parametrosBusqueda: any): Observable<any> {
    const params = this.crearParametros(parametrosBusqueda);
    return this.http.get(this.apiUrl, { params });
  }

  private crearParametros(parametrosBusqueda: any): HttpParams {
    let params = new HttpParams();

    Object.keys(parametrosBusqueda).forEach((key) => {
      const valor = parametrosBusqueda[key];

      if (valor !== null && valor !== undefined && String(valor).trim() !== '') {
        params = params.set(key, valor);
      }
    });

    return params;
  }
}
