import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, pawOutline } from 'ionicons/icons';
import { HallazgoService } from '../../services/hallazgo.service';

interface HallazgoVista {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  imagen: string;
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
        const hallazgos = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? respuesta?.hallazgos ?? [];
        this.hallazgos = hallazgos.map((hallazgo: any) => this.normalizarHallazgo(hallazgo));
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los hallazgos';
        this.cargando = false;
      }
    });
  }

  private normalizarHallazgo(hallazgo: any): HallazgoVista {
    return {
      nombre: hallazgo.h_nom_masc || hallazgo.H_Nom_Masc || hallazgo.nombreMascota || hallazgo.nombre || 'Mascota encontrada',
      ubicacion: hallazgo.h_comuna || hallazgo.H_Comuna || hallazgo.comuna || hallazgo.ciudad || 'Ubicación sin registrar',
      descripcion: hallazgo.h_inf_adic || hallazgo.H_Inf_Adic || hallazgo.h_fisica || hallazgo.H_Fisica || hallazgo.descripcion || 'Sin descripción disponible.',
      imagen: this.obtenerImagen(hallazgo.h_imagen || hallazgo.H_Imagen || hallazgo.imagen)
    };
  }

  private obtenerImagen(imagen: any) {
    if (!imagen) {
      return '';
    }

    if (typeof imagen === 'string') {
      if (imagen.startsWith('data:image/')) {
        return imagen;
      }

      if (imagen.startsWith('\\x')) {
        return this.crearDataUrlDesdeHexadecimal(imagen.slice(2));
      }

      return '';
    }

    if (Array.isArray(imagen)) {
      return this.crearDataUrlDesdeBytes(imagen);
    }

    if (Array.isArray(imagen.data)) {
      return this.crearDataUrlDesdeBytes(imagen.data);
    }

    return '';
  }

  private crearDataUrlDesdeHexadecimal(hexadecimal: string) {
    const bytes: number[] = [];

    for (let i = 0; i < hexadecimal.length; i += 2) {
      bytes.push(parseInt(hexadecimal.substring(i, i + 2), 16));
    }

    return this.crearDataUrlDesdeBytes(bytes);
  }

  private crearDataUrlDesdeBytes(bytes: number[]) {
    const tipo = this.obtenerTipoImagen(bytes);
    let binario = '';

    for (let i = 0; i < bytes.length; i += 1) {
      binario += String.fromCharCode(bytes[i]);
    }

    return `data:${tipo};base64,${btoa(binario)}`;
  }

  private obtenerTipoImagen(bytes: number[]) {
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      return 'image/png';
    }

    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return 'image/jpeg';
    }

    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return 'image/gif';
    }

    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      return 'image/webp';
    }

    return 'image/jpeg';
  }

}
