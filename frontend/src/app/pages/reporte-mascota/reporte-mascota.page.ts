import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, pawOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reporte-mascota',
  templateUrl: './reporte-mascota.page.html',
  styleUrls: ['./reporte-mascota.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReporteMascotaPage implements OnInit {
  tipoReporte: 'perdida' | 'hallazgo' | 'adopcion' = 'perdida';
  tipoMascota: 'perro' | 'gato' | 'otro' = 'perro';

  constructor() {
    addIcons({ cameraOutline, pawOutline });
  }

  ngOnInit() {
  }

  seleccionarTipoReporte(tipoReporte: 'perdida' | 'hallazgo' | 'adopcion') {
    this.tipoReporte = tipoReporte;
  }

  seleccionarTipoMascota(tipoMascota: 'perro' | 'gato' | 'otro') {
    this.tipoMascota = tipoMascota;
  }

}
