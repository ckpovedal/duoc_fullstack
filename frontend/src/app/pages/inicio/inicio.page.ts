import { Component, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule]
})
export class InicioPage implements OnDestroy {

  private router = inject(Router);
  private logger = inject(LoggerService);
  private redireccionTimer?: ReturnType<typeof setTimeout>;

  @ViewChild('backgroundVideo') videoElement!: ElementRef<HTMLVideoElement>;

  ionViewDidEnter() {
    this.reproducirVideo();
    this.redireccionTimer = setTimeout(() => {
      this.router.navigateByUrl('/principal', { replaceUrl: true });
    }, 4000);
  }

  ionViewWillLeave() {
    this.pausarVideo();
    this.limpiarRedireccion();
  }

  ngOnDestroy() {
    this.limpiarRedireccion();
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

  private limpiarRedireccion() {
    if (this.redireccionTimer) {
      clearTimeout(this.redireccionTimer);
      this.redireccionTimer = undefined;
    }
  }
}
