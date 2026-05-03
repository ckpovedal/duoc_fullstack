import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HallazgoService {
  private apiUrl = `${environment.apiUrl}/hallazgos`;

  constructor(private http: HttpClient) {}

  crearHallazgo(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  listarHallazgos(filtros: any = {}): Observable<any> {
    const params = this.crearParametros(filtros);
    return this.http.get(this.apiUrl, { params });
  }

  obtenerHallazgo(idHallazgo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${idHallazgo}`);
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
