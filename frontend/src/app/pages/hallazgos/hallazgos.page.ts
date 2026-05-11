import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline, pawOutline } from 'ionicons/icons';
import { HallazgoService } from '../../services/hallazgo.service';
import {
  acortarTexto,
  formatearFechaReporte,
  obtenerClaseEstado,
  obtenerEstadoHallazgo,
  obtenerImagenMascota,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface HallazgoVista {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  estado: string;
  estadoClase: string;
}

@Component({
  selector: 'app-hallazgos',
  templateUrl: './hallazgos.page.html',
  styleUrls: ['./hallazgos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HallazgosPage implements OnInit {
  hallazgos: HallazgoVista[] = [];
  cargando = false;
  error = '';

  filtros = {
    texto: '',
    tipo: '',
    estado: '',
    comuna: ''
  };

  pagina = 1;
  limite = 10;
  totalPaginas = 1;
  tieneMas = false;

  constructor(
    private hallazgoService: HallazgoService,
    private router: Router
  ) {
    addIcons({ calendarOutline, locationOutline, pawOutline });
  }

  ngOnInit() {
    this.cargarHallazgos();
  }

  cargarHallazgos(agregar = false) {
    this.cargando = true;
    this.error = '';

    const parametros = {
      ...this.filtros,
      pagina: this.pagina,
      limite: this.limite
    };

    this.hallazgoService.listarHallazgos(parametros)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;
          const items = Array.isArray(data) ? data : data?.items || data?.hallazgos || [];
          const paginacion = Array.isArray(data) ? null : data?.paginacion;
          const hallazgos = items.map((hallazgo: any) => this.normalizarHallazgo(hallazgo));

          this.hallazgos = agregar ? [...this.hallazgos, ...hallazgos] : hallazgos;
          this.totalPaginas = paginacion?.totalPaginas || 1;
          this.tieneMas = Boolean(paginacion?.tieneMas);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.hallazgos = [];
        }
      });
  }

  aplicarFiltros() {
    this.pagina = 1;
    this.cargarHallazgos();
  }

  limpiarFiltros() {
    this.filtros = {
      texto: '',
      tipo: '',
      estado: '',
      comuna: ''
    };

    this.pagina = 1;
    this.cargarHallazgos();
  }

  cargarMas() {
    if (!this.tieneMas || this.cargando) {
      return;
    }

    this.pagina += 1;
    this.cargarHallazgos(true);
  }

  paginaAnterior() {
    if (this.pagina <= 1 || this.cargando) {
      return;
    }

    this.pagina -= 1;
    this.cargarHallazgos();
  }

  paginaSiguiente() {
    if (this.pagina >= this.totalPaginas || this.cargando) {
      return;
    }

    this.pagina += 1;
    this.cargarHallazgos();
  }

  verDetalle(hallazgo: HallazgoVista) {
    if (!hallazgo.id) {
      return;
    }

    this.router.navigate(['/mascota-hallada', hallazgo.id]);
  }

  private normalizarHallazgo(hallazgo: any): HallazgoVista {
    const comuna = obtenerTextoReporte(hallazgo.h_comuna ?? hallazgo.H_Comuna, '');
    const region = obtenerTextoReporte(hallazgo.h_region ?? hallazgo.H_Region, '');
    const descripcion = obtenerTextoReporte(
      hallazgo.h_inf_adic ?? hallazgo.H_Inf_Adic,
      obtenerTextoReporte(hallazgo.h_fisica ?? hallazgo.H_Fisica, 'Sin descripción disponible.')
    );
    const estado = hallazgo.h_estado ?? hallazgo.H_Estado;

    return {
      id: String(hallazgo.h_id ?? hallazgo.H_ID ?? ''),
      nombre: obtenerTextoReporte(hallazgo.h_nom_masc ?? hallazgo.H_Nom_Masc, 'Mascota encontrada'),
      tipo: obtenerTipoMascota(hallazgo.h_tipo ?? hallazgo.H_Tipo),
      ubicacion: this.obtenerUbicacion(comuna, region),
      descripcion: acortarTexto(descripcion, 120),
      imagen: obtenerImagenMascota(hallazgo.h_imagen ?? hallazgo.H_Imagen),
      fecha: formatearFechaReporte(hallazgo.h_fecha ?? hallazgo.H_Fecha),
      estado: obtenerEstadoHallazgo(estado),
      estadoClase: obtenerClaseEstado(estado)
    };
  }

  private obtenerUbicacion(comuna: string, region: string): string {
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

  private obtenerMensajeError(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudieron cargar los hallazgos';
  }

}
