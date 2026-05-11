import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { NavigationEnd, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { IonApp, IonIcon, IonRouterOutlet} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { addCircle, homeOutline, pawOutline, personCircleOutline, searchOutline} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    IonApp,
    IonIcon,
    IonRouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
})

export class AppComponent {

  estaLogueado = false;

  constructor( private titleService: Title, private router: Router) {
    this.titleService.setTitle('Sanos y Salvos');
    addIcons({ addCircle, homeOutline, pawOutline, personCircleOutline, searchOutline});
    this.validarSesion();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.validarSesion();
      }
    });
  }

  validarSesion() {
    this.estaLogueado = !!localStorage.getItem('usuario_id') || !!localStorage.getItem('usuario') || !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('token');
    this.estaLogueado = false;
    this.router.navigate(['/inicio']);
  }

  mostrarNavbar(): boolean {
    return true;
  }

  mostrarMenuMovil(): boolean {
    const rutasConMenu = [
      '/principal',
      '/buscador',
      '/reporte-mascota',
      '/mascotas-halladas',
      '/hallazgos',
      '/mascota-perdida',
      '/mascota-hallada',
      '/mi-perfil'
    ];

    return rutasConMenu.some((ruta) =>
      this.router.url.startsWith(ruta)
    );
  }
}
