import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, homeOutline, pawOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonIcon, IonRouterOutlet, CommonModule, RouterLink, RouterLinkActive],
})
export class AppComponent {
  constructor(private titleService: Title, private router: Router) {
    this.titleService.setTitle('Sanos y Salvos');
    addIcons({ addCircle, homeOutline, pawOutline, searchOutline });
  }

  mostrarMenuMovil() {
    const rutasConMenu = ['/principal', '/buscador', '/reporte-mascota', '/hallazgos'];
    return rutasConMenu.some((ruta) => this.router.url.startsWith(ruta));
  }
}
