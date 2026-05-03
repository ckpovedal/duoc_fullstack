import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.page.html',
  styleUrls: ['./nuevo-usuario.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NuevoUsuarioPage implements OnInit {
  usuario = {
    nombre: '',
    tipo: 'Dueño',
    direccion: '',
    comuna: '',
    region: '',
    telefono: '',
    correo: '',
    clave: ''
  };

  cargando = false;
  mensaje = '';
  error = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  crearUsuario() {
    this.error = '';
    this.mensaje = '';

    if (!this.usuario.nombre.trim() || !this.usuario.tipo.trim() || !this.usuario.correo.trim() || !this.usuario.clave.trim()) {
      this.error = 'Nombre, tipo, correo y clave son obligatorios';
      return;
    }

    this.cargando = true;

    const data = {
      ...this.usuario,
      nombre: this.usuario.nombre.trim(),
      direccion: this.usuario.direccion.trim(),
      comuna: this.usuario.comuna.trim(),
      region: this.usuario.region.trim(),
      correo: this.usuario.correo.trim(),
      clave: this.usuario.clave.trim(),
      telefono: this.usuario.telefono.trim() ? Number(this.usuario.telefono) : null
    };

    this.usuarioService.crearUsuario(data).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta.mensaje || 'Usuario creado correctamente';
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.error = error?.error?.mensaje || 'No se pudo crear el usuario';
        this.cargando = false;
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
