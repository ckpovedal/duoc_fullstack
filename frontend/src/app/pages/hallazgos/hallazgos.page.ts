import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, pawOutline } from 'ionicons/icons';
import { HallazgoService } from '../../services/hallazgo.service';

@Component({
  selector: 'app-hallazgos',
  templateUrl: './hallazgos.page.html',
  styleUrls: ['./hallazgos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class HallazgosPage implements OnInit {
  hallazgos: any[] = [];
  cargando = false;
  error = '';

  constructor(private hallazgoService: HallazgoService) {
    addIcons({ locationOutline, pawOutline });
  }

  ngOnInit() {
    this.cargarHallazgos();
  }

  cargarHallazgos() {
    this.cargando = true;
    this.error = '';

    this.hallazgoService.listarHallazgos().subscribe({
      next: (respuesta) => {
        this.hallazgos = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? respuesta?.hallazgos ?? [];
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los hallazgos';
        this.cargando = false;
      }
    });
  }

}
