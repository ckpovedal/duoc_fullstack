import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronBackOutline, homeOutline, locationOutline, pawOutline, personAddOutline, personOutline } from 'ionicons/icons';
import { PerdidaService } from '../../services/perdida.service';
import {
  formatearFechaReporte,
  obtenerClaseEstado,
  obtenerEdadMascota,
  obtenerEstadoPerdida,
  obtenerGeneroMascota,
  obtenerImagenMascota,
  obtenerRespuestaReporte,
  obtenerTextoReporte,
  obtenerTipoMascota
} from '../../utils/reporte-mascota.utils';

interface MascotaPerdidaVista {
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
  selector: 'app-mascota-perdida',
  templateUrl: './mascota-perdida.page.html',
  styleUrls: ['./mascota-perdida.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule]
})
export class MascotaPerdidaPage implements OnInit {
  mascota: MascotaPerdidaVista | null = null;
  cargando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perdidaService: PerdidaService
  ) {
    addIcons({ calendarOutline, chevronBackOutline, homeOutline, locationOutline, pawOutline, personOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'No se encontró el reporte solicitado';
      return;
    }

    this.cargarPerdida(id);
  }

  irInicio() {
    this.router.navigate(['/principal']);
  }

  volver() {
    this.router.navigate(['/buscador']);
  }

  cargarPerdida(id: string) {
    this.cargando = true;
    this.error = '';

    this.perdidaService.obtenerPerdida(id)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (respuesta) => {
          const data = respuesta?.respuesta || respuesta?.data || respuesta;

          console.log('Detalle pérdida completo:', data);
          console.log('Campos disponibles:', Object.keys(data));

          this.mascota = this.normalizarPerdida(data);
        }, error: (error) => {
          this.error = this.obtenerMensajeError(error);
          this.mascota = null;
        }
      });
  }

  private normalizarPerdida(perdida: any): MascotaPerdidaVista {
    const estado = perdida.p_estado ?? perdida.P_Estado;

    return {
      nombre: obtenerTextoReporte(perdida.p_nom_masc ?? perdida.P_Nom_Masc, 'Mascota perdida'),
      tipo: obtenerTipoMascota(perdida.p_tipo ?? perdida.P_Tipo),
      edad: obtenerEdadMascota(perdida.p_edad ?? perdida.P_Edad),
      genero: obtenerGeneroMascota(perdida.p_genero ?? perdida.P_Genero),
      fisica: obtenerTextoReporte(perdida.p_fisica ?? perdida.P_Fisica, 'Sin registrar'),
      personalidad: obtenerTextoReporte(perdida.p_perso ?? perdida.P_Perso, 'Sin registrar'),
      informacionAdicional: obtenerTextoReporte(perdida.p_inf_adic ?? perdida.P_Inf_Adic, 'Sin registrar'),
      esterilizado: obtenerRespuestaReporte(perdida.p_esterilizado ?? perdida.P_Esterilizado),
      vacunas: obtenerRespuestaReporte(perdida.p_vacunas ?? perdida.P_Vacunas),
      direccion: obtenerTextoReporte(perdida.p_dire_inter ?? perdida.P_Dire_Inter, 'Sin registrar'),
      comuna: obtenerTextoReporte(perdida.p_comuna ?? perdida.P_Comuna, 'Sin registrar'),
      region: obtenerTextoReporte(perdida.p_region ?? perdida.P_Region, 'Sin registrar'),
      fecha: formatearFechaReporte(perdida.p_fecha ?? perdida.P_Fecha),
      imagen: obtenerImagenMascota(perdida.p_imagen ?? perdida.P_Imagen),
      estado: obtenerEstadoPerdida(estado),
      estadoClase: obtenerClaseEstado(estado),
      publicadoPor: obtenerTextoReporte(
        perdida.usuario_nombre ??
        perdida.Usuario_Nombre ??
        perdida.nombre_usuario ??
        perdida.Nombre_Usuario ??
        perdida.p_usuario ??
        perdida.P_Usuario,
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
