import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';

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
        const usuario = respuesta.respuesta;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        if (usuario?.idUsuario) {
          localStorage.setItem('usuario_id', usuario.idUsuario);
        }

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
