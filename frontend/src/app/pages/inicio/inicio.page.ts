import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon  } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pawOutline } from 'ionicons/icons'; 



@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class InicioPage {

  @ViewChild('backgroundVideo') videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router) { 
    addIcons({ pawOutline });
  }

  ionViewDidEnter() {
    this.reproducirVideo();
  }

  ionViewWillLeave() {
    this.pausarVideo();
  }

  private reproducirVideo() {
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      
      // Forzamos el mute (requisito de navegadores para autoplay)
      video.muted = true; 
      
      video.play().catch(err => {
        console.warn('La reproducción automática fue bloqueada. Intentando de nuevo...', err);
        // Re-intento por si el DOM tardó un poco más
        setTimeout(() => video.play(), 500);
      });
    }
  }

  private pausarVideo() {
    if (this.videoElement) {
      this.videoElement.nativeElement.pause();
    }
  }

  irALogin() {
    this.router.navigate(['/login']); 

  }
}
