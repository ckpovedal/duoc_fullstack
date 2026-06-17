import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';
import { SesionService } from '../../services/sesion.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonText, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  correo: string = '';
  clave: string = '';
  cargando = false;
  error: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private sesionService: SesionService,
    private notificacionService: NotificacionService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.correo = '';
    this.clave = '';
    this.error = '';
    this.cargando = false;
  }

  iniciarSesion() {
    this.error = '';

    if (!this.correo.trim() || !this.clave.trim()) {
      this.error = 'Ingresa correo y clave';
      return;
    }

    this.cargando = true;

    const data = {
      correo: this.correo.trim(),
      clave: this.clave
    };

    this.usuarioService.login(data).subscribe({
      next: (respuesta) => {
        const login = respuesta.respuesta;
        const usuario = login?.usuario || login;
        const token = login?.token || '';

        this.sesionService.guardarSesion(usuario, token);
        this.notificacionService.inicializarPush();

        this.router.navigate(['/principal']);
      },
      error: (error) => {
        this.error = error?.error?.mensaje || 'No se pudo iniciar sesion';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  irRegistro() {
    this.router.navigate(['/nuevo-usuario']);
  }
}
