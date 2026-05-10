import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pawOutline } from 'ionicons/icons';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonIcon, CommonModule, FormsModule]
})
export class InicioPage {

  private router = inject(Router);
  private logger = inject(LoggerService);

  @ViewChild('backgroundVideo') videoElement!: ElementRef<HTMLVideoElement>;

  constructor() {
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

      video.muted = true;

      video.play().catch((err: unknown) => {
        this.logger.warn('inicio', {
          mensaje: 'La reproduccion automatica fue bloqueada',
          error: err
        });
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
