import { Component } from '@angular/core';
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
    setTimeout(() => {
      const video = document.querySelector('#background-video') as HTMLVideoElement;
      if (video) {
        video.play().catch(err => console.log('Error:', err));
      }
    }, 100);
  }

  private pausarVideo() {
    const video = document.querySelector('#background-video') as HTMLVideoElement;
    if (video) {
      video.pause();
    }
  }

  irALogin() {
    this.router.navigate(['/login']); 

  }
}
