import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, pawOutline, searchOutline } from 'ionicons/icons';
import { BuscadorService } from '../../services/buscador.service';
import {
  acortarTexto,
  obtenerClaseEstado,
  obtenerEstadoHallazgo,
  obtenerEstadoPerdida,
  obtenerImagenMascota,
  obtenerTextoReporte
} from '../../utils/reporte-mascota.utils';

interface CoincidenciaVista {
  id: string;
  tipoReporte: string;
  tipoReporteCodigo: string;
  tipoReporteClase: string;
  nombre: string;
  ubicacion: string;
  descripcion: string;
  imagen: string;
  estado: string;
  estadoClase: string;
  nivel: string;
  nivelClase: string;
}

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BuscadorPage implements OnInit {
  terminoBusqueda = '';
  coincidencias: CoincidenciaVista[] = [];
  cargando = false;
  error = '';
  busquedaRealizada = false;

  constructor(
    private buscadorService: BuscadorService,
    private router: Router
  ) {
    addIcons({ locationOutline, pawOutline, searchOutline });
  }

  ngOnInit() {
  }

  buscarCoincidencias() {
    const texto = this.terminoBusqueda.trim();

    if (!texto) {
      this.error = 'Ingresa al menos un dato para buscar';
      this.coincidencias = [];
      this.busquedaRealizada = false;
      return;
    }

    this.cargando = true;
    this.error = '';
    this.busquedaRealizada = true;

    this.buscadorService.buscarPorParametros({ texto })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {

          const coincidencias =
            respuesta?.data?.coincidencias ||
            respuesta?.data?.items ||
            respuesta?.respuesta?.coincidencias ||
            respuesta?.respuesta?.items ||
            respuesta?.coincidencias ||
            respuesta?.items ||
            [];

          this.coincidencias = Array.isArray(coincidencias)
            ? coincidencias.map((item: any) => this.normalizarCoincidencia(item))
            : [];
        },

        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.coincidencias = [];
        }
      });
  }

  verDetalle(coincidencia: CoincidenciaVista) {
    if (!coincidencia.id) {
      return;
    }

    const ruta = coincidencia.tipoReporteCodigo === 'PERDIDO'
      ? '/mascota-perdida'
      : '/mascota-hallada';

    this.router.navigate([ruta, coincidencia.id]);
  }

  private normalizarCoincidencia(item: any): CoincidenciaVista {
    const tipoReporte = String(item.tipoReporte ?? (item.perdida ? 'PERDIDO' : 'HALLADO')).toUpperCase();
    const reporte = item.reporte || item.hallazgo || item.perdida || item || {};
    const esPerdido = tipoReporte === 'PERDIDO';
    const id = esPerdido
      ? reporte.p_id ?? reporte.P_ID
      : reporte.h_id ?? reporte.H_ID;
    const estado = esPerdido
      ? reporte.p_estado ?? reporte.P_Estado
      : reporte.h_estado ?? reporte.H_Estado;
    
    const descripcion = obtenerTextoReporte(
      esPerdido ? reporte.p_fisica ?? reporte.P_Fisica : reporte.h_fisica ?? reporte.H_Fisica,
      obtenerTextoReporte(
        esPerdido ? reporte.p_inf_adic ?? reporte.P_Inf_Adic : reporte.h_inf_adic ?? reporte.H_Inf_Adic,
        'Sin descripción disponible.'
      )
    );

    return {
      id: id === undefined || id === null ? '' : String(id),
      tipoReporte: esPerdido ? 'Mascota perdida' : 'Mascota hallada',
      tipoReporteCodigo: tipoReporte,
      tipoReporteClase: this.obtenerClaseTipoReporte(tipoReporte),
      nombre: obtenerTextoReporte(
        esPerdido ? reporte.p_nom_masc ?? reporte.P_Nom_Masc : reporte.h_nom_masc ?? reporte.H_Nom_Masc,
        esPerdido ? 'Mascota perdida' : 'Mascota hallada'
      ),
      ubicacion: this.obtenerUbicacion(reporte, tipoReporte),
      descripcion: acortarTexto(descripcion, 120),
      imagen: obtenerImagenMascota(esPerdido ? reporte.p_imagen ?? reporte.P_Imagen : reporte.h_imagen ?? reporte.H_Imagen),
      estado: esPerdido ? obtenerEstadoPerdida(estado) : obtenerEstadoHallazgo(estado),
      estadoClase: obtenerClaseEstado(estado),
      nivel: this.obtenerNivel(item.nivel),
      nivelClase: this.obtenerClaseNivel(item.nivel)
    };
  }

  private obtenerUbicacion(reporte: any, tipoReporte: string): string {
    const esPerdido = tipoReporte === 'PERDIDO';
    const comuna = obtenerTextoReporte(esPerdido ? reporte.p_comuna ?? reporte.P_Comuna : reporte.h_comuna ?? reporte.H_Comuna, '');
    const region = obtenerTextoReporte(esPerdido ? reporte.p_region ?? reporte.P_Region : reporte.h_region ?? reporte.H_Region, '');

    if (comuna && region) {
      return `${comuna}, ${region}`;
    }

    if (comuna) {
      return comuna;
    }

    if (region) {
      return region;
    }

    return 'Ubicación sin registrar';
  }

  private obtenerNivel(nivel: unknown): string {
    const niveles: Record<string, string> = {
      ALTA: 'Coincidencia alta',
      MEDIA: 'Coincidencia media',
      BAJA: 'Coincidencia baja'
    };

    return niveles[String(nivel).toUpperCase()] || 'Coincidencia';
  }

  private obtenerClaseNivel(nivel: unknown): string {
    const clases: Record<string, string> = {
      ALTA: 'nivel-alta',
      MEDIA: 'nivel-media',
      BAJA: 'nivel-baja'
    };

    return clases[String(nivel).toUpperCase()] || 'nivel-base';
  }

  private obtenerClaseTipoReporte(tipoReporte: unknown): string {
    const tipo = String(tipoReporte).toUpperCase();

    if (tipo === 'PERDIDO') {
      return 'tipo-perdido';
    }

    if (tipo === 'HALLADO') {
      return 'tipo-hallado';
    }

    return 'tipo-base';
  }

  private obtenerMensajeError(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudieron obtener coincidencias';
  }

}
