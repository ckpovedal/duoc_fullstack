import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonativoService {
  private apiUrl = `${environment.apiUrl}/donativos`;

  constructor(private http: HttpClient) {}

  crearDonativo(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  obtenerResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`);
  }

  listarDonativosAdmin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin`);
  }

  obtenerDonativoAdmin(idDonativo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/${idDonativo}`);
  }
}
