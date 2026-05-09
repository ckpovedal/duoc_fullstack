import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonTitle, IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonToolbar, IonButtons} from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';
import { COMUNAS_SANTIAGO_RM, REGION_COMUNAS_SANTIAGO_RM } from '../../data/comunas-santiago-rm';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.page.html',
  styleUrls: ['./nuevo-usuario.page.scss'],
  standalone: true,
  imports: [IonTitle, IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonToolbar, IonButtons, CommonModule, FormsModule]
})
export class NuevoUsuarioPage implements OnInit {

  comunas = COMUNAS_SANTIAGO_RM;

  usuario = {
    nombre: '',
    tipo: 'Dueño',
    direccion: '',
    comuna: '',
    region: REGION_COMUNAS_SANTIAGO_RM,
    telefono: '',
    correo: '',
    clave: ''
  };

  // Nueva propiedad para la verificación de clave
  verificacionClave = '';
  
  // Propiedades para validación
  clavesNoCoinciden = false;
  claveValida = false;

  cargando = false;
  mensaje = '';
  error = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    addIcons({ logOutOutline})
   }

  ngOnInit() {
  }

  salir() {
    this.router.navigate(['/inicio']); // O a la ruta que necesites
  }

  // Método para validar que las claves coincidan
  validarClaves() {
    if (this.usuario.clave && this.verificacionClave) {
      this.clavesNoCoinciden = this.usuario.clave !== this.verificacionClave;
      this.claveValida = !this.clavesNoCoinciden;
    } else {
      this.clavesNoCoinciden = false;
      this.claveValida = false;
    }
  }

  crearUsuario() {
    this.error = '';
    this.mensaje = '';

    if (!this.usuario.nombre.trim() || !this.usuario.tipo.trim() || !this.usuario.correo.trim() || !this.usuario.clave.trim()) {
      this.error = 'Nombre, tipo, correo y clave son obligatorios';
      return;
    }

    // 🔐 VALIDACIÓN DE CONTRASEÑAS COINCIDENTES
    if (this.usuario.clave !== this.verificacionClave) {
      this.error = '⚠️ Las contraseñas no coinciden';
      return;
    }

    // Opcional: Validar fortaleza de la contraseña
    if (this.usuario.clave.length < 4) {
      this.error = 'La contraseña debe tener al menos 4 caracteres';
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
