import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResultadoGeocodificacion {
  direccionFormateada: string | null;
  latitud: number | null;
  longitud: number | null;
  comuna: string | null;
  region: string | null;
  pais: string | null;
  importancia: number | null;
  tipo: string | null;
  clase: string | null;
  boundingBox: string[] | null;
}

export interface RespuestaGeocodificacion {
  busqueda: string;
  total: number;
  resultados: ResultadoGeocodificacion[];
}

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {
  private apiUrl = `${environment.apiUrl}/geolocalizacion`;

  constructor(private http: HttpClient) {}

  geocodificar(data: {
    direccion: string;
    comuna?: string;
    region?: string;
    limite?: number;
  }): Observable<any> {
    let params = new HttpParams()
      .set('direccion', data.direccion)
      .set('limite', String(data.limite || 1));

    if (data.comuna) {
      params = params.set('comuna', data.comuna);
    }

    if (data.region) {
      params = params.set('region', data.region);
    }

    return this.http.get(`${this.apiUrl}/geocodificar`, { params });
  }
}
