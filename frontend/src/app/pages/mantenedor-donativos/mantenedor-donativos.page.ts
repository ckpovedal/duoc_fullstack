import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonSpinner, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, refreshOutline } from 'ionicons/icons';
import { DonativoService } from '../../services/donativo.service';

@Component({
  selector: 'app-mantenedor-donativos',
  templateUrl: './mantenedor-donativos.page.html',
  styleUrls: ['./mantenedor-donativos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonSpinner, IonText, IonTitle, IonToolbar, CommonModule]
})
export class MantenedorDonativosPage implements OnInit {
  resumen: any = null;
  donativos: any[] = [];
  cargando = false;
  error = '';

  constructor(
    private donativoService: DonativoService,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, refreshOutline });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.error = '';

    this.donativoService.obtenerResumen().subscribe({
      next: (respuesta) => {
        this.resumen = respuesta.respuesta;
      },
      error: () => {
        this.resumen = null;
      }
    });

    this.donativoService.listarDonativosAdmin().subscribe({
      next: (respuesta) => {
        this.donativos = Array.isArray(respuesta.respuesta) ? respuesta.respuesta : [];
      },
      error: (error) => {
        this.error = error?.error?.mensaje || 'No se pudieron cargar los donativos';
        this.donativos = [];
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  volverPrincipal() {
    this.router.navigate(['/principal']);
  }

  formatearMoneda(valor: any) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(valor) || 0);
  }

  formatearFecha(valor: any) {
    if (!valor) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(valor));
  }

  obtenerEstado(estado: any) {
    const valor = Number(estado);

    if (valor === 2) {
      return 'Aprobado';
    }

    if (valor === 3) {
      return 'Rechazado';
    }

    return 'Pendiente';
  }

  obtenerClaseEstado(estado: any) {
    const valor = Number(estado);

    if (valor === 2) {
      return 'estado-aprobado';
    }

    if (valor === 3) {
      return 'estado-rechazado';
    }

    return 'estado-pendiente';
  }
}
