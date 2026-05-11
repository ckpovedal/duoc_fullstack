import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronBackOutline, locationOutline, pawOutline, personOutline } from 'ionicons/icons';
import { HallazgoService } from '../../services/hallazgo.service';
import {
  formatearFechaReporte,
  obtenerClaseEstado,
  obtenerEdadMascota,
  obtenerEstadoHallazgo,
  obtenerGeneroMascota,
  obtenerImagenMascota,
  obtenerRespuestaReporte,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface MascotaHalladaVista {
  nombre: string;
  tipo: string;
  edad: string;
  genero: string;
  fisica: string;
  personalidad: string;
  informacionAdicional: string;
  esterilizado: string;
  vacunas: string;
  direccion: string;
  comuna: string;
  region: string;
  fecha: string;
  imagen: string;
  estado: string;
  estadoClase: string;
  publicadoPor: string;
}

@Component({
  selector: 'app-mascota-hallada',
  templateUrl: './mascota-hallada.page.html',
  styleUrls: ['./mascota-hallada.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MascotaHalladaPage implements OnInit {
  mascota: MascotaHalladaVista | null = null;
  cargando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hallazgoService: HallazgoService
  ) {
    addIcons({ calendarOutline, chevronBackOutline, locationOutline, pawOutline, personOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el reporte solicitado';
      return;
    }

    this.cargarHallazgo(id);
  }

  volver() {
    this.router.navigate(['/buscador']);
  }

  irInicio() {
    this.router.navigate(['/principal']);
  }

  cargarHallazgo(id: string) {
    this.cargando = true;
    this.error = '';

    this.hallazgoService.obtenerHallazgo(id)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;
          this.mascota = this.normalizarHallazgo(data);
        },
        error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mascota = null;
        }
      });
  }

  private normalizarHallazgo(hallazgo: any): MascotaHalladaVista {
    const estado = hallazgo.h_estado ?? hallazgo.H_Estado;

    return {
      nombre: obtenerTextoReporte(hallazgo.h_nom_masc ?? hallazgo.H_Nom_Masc, 'Mascota hallada'),
      tipo: obtenerTipoMascota(hallazgo.h_tipo ?? hallazgo.H_Tipo),
      edad: obtenerEdadMascota(hallazgo.h_edad ?? hallazgo.H_Edad),
      genero: obtenerGeneroMascota(hallazgo.h_genero ?? hallazgo.H_Genero),
      fisica: obtenerTextoReporte(hallazgo.h_fisica ?? hallazgo.H_Fisica, 'Sin registrar'),
      personalidad: obtenerTextoReporte(hallazgo.h_perso ?? hallazgo.H_Perso, 'Sin registrar'),
      informacionAdicional: obtenerTextoReporte(hallazgo.h_inf_adic ?? hallazgo.H_Inf_Adic, 'Sin registrar'),
      esterilizado: obtenerRespuestaReporte(hallazgo.h_esterilizado ?? hallazgo.H_Esterilizado),
      vacunas: obtenerRespuestaReporte(hallazgo.h_vacunas ?? hallazgo.H_Vacunas),
      direccion: obtenerTextoReporte(hallazgo.h_dire_inter ?? hallazgo.H_Dire_Inter, 'Sin registrar'),
      comuna: obtenerTextoReporte(hallazgo.h_comuna ?? hallazgo.H_Comuna, 'Sin registrar'),
      region: obtenerTextoReporte(hallazgo.h_region ?? hallazgo.H_Region, 'Sin registrar'),
      fecha: formatearFechaReporte(hallazgo.h_fecha ?? hallazgo.H_Fecha),
      imagen: obtenerImagenMascota(hallazgo.h_imagen ?? hallazgo.H_Imagen),
      estado: obtenerEstadoHallazgo(estado),
      estadoClase: obtenerClaseEstado(estado),
      publicadoPor: obtenerTextoReporte(
        hallazgo.usuario_nombre ??
        hallazgo.u_nombre ??
        hallazgo.nombre ??
        hallazgo.Nombre ??
        hallazgo.usuario_id ??
        hallazgo.u_id,
        'Usuario no informado'
      )
    };
  }

  private obtenerMensajeError(error: any): string {
    if (error?.name === 'TimeoutError') {
      return 'El servidor no respondió a tiempo. Intenta nuevamente';
    }

    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa que los servicios estén encendidos';
    }

    return error?.error?.mensaje || 'No se pudo cargar el reporte';
  }
}
