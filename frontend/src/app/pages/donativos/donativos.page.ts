import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, heartOutline } from 'ionicons/icons';
import { DonativoService } from '../../services/donativo.service';

@Component({
  selector: 'app-donativos',
  templateUrl: './donativos.page.html',
  styleUrls: ['./donativos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonInput, IonItem, IonList, IonSpinner, IonText, IonTextarea, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DonativosPage {
  donativo = {
    nombre: '',
    correo: '',
    monto: null as number | null,
    mensaje: ''
  };

  donativoCreado: any = null;
  cargando = false;
  error = '';

  constructor(
    private donativoService: DonativoService,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, heartOutline });
  }

  crearDonativo() {
    this.error = '';
    this.donativoCreado = null;

    const nombre = this.donativo.nombre.trim();
    const correo = this.donativo.correo.trim();
    const mensaje = this.donativo.mensaje.trim();
    const monto = Number(this.donativo.monto);

    if (!nombre || !correo || !Number.isFinite(monto) || monto <= 0) {
      this.error = 'Nombre, correo y monto son obligatorios';
      return;
    }

    if (!this.correoValido(correo)) {
      this.error = 'Ingresa un correo valido';
      return;
    }

    this.cargando = true;

    this.donativoService.crearDonativo({
      nombre,
      correo,
      monto,
      mensaje
    }).subscribe({
      next: (respuesta) => {
        this.donativoCreado = respuesta.respuesta;
        this.donativo = {
          nombre: '',
          correo: '',
          monto: null,
          mensaje: ''
        };
      },
      error: (error) => {
        this.error = error?.error?.mensaje || 'No se pudo registrar el donativo';
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

  private correoValido(correo: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }
}
