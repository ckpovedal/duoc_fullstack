import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonTitle, IonButton, IonContent, IonHeader, IonInput, IonItem, IonList, IonSelect, IonSelectOption, IonText, IonToolbar, IonButtons} from '@ionic/angular/standalone';
import { UsuarioService } from '../../services/usuario.service';
import { COMUNAS_SANTIAGO_RM, REGION_COMUNAS_SANTIAGO_RM } from '../../data/comunas-santiago-rm';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { ToastController } from '@ionic/angular';

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
    private router: Router,
    private toastController: ToastController
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

  // Método auxiliar para mostrar mensajes con el prefijo "Sanos y Salvos dice"
  async mostrarMensaje(tipo: 'error' | 'exito', texto: string) {
    const prefijo = '🐾 Sanos y Salvos dice:';
    const mensajeCompleto = `${prefijo} ${texto}`;

    const toast = await this.toastController.create({
      message: mensajeCompleto,
      duration: 3000,
      position: 'bottom',
      color: tipo === 'error' ? 'danger' : 'success',
      buttons: [
        {
        text: 'Cerrar',
        role: 'cancel'
        }
      ]
    })

  await toast.present();
  }
  

  crearUsuario() {
    this.error = '';
    this.mensaje = '';

    if (!this.usuario.nombre.trim() || !this.usuario.tipo.trim() || !this.usuario.correo.trim() || !this.usuario.clave.trim()) {
      this.mostrarMensaje('error', 'Nombre, tipo, correo y clave son obligatorios');
      return;
    }

    // 🔐 VALIDACIÓN DE CONTRASEÑAS COINCIDENTES
    if (this.usuario.clave !== this.verificacionClave) {
      this.mostrarMensaje('error', '⚠️ Las contraseñas no coinciden');
      return;
    }

    // Opcional: Validar fortaleza de la contraseña
    if (this.usuario.clave.length < 8) {
      this.mostrarMensaje('error', 'La contraseña debe tener al menos 8 caracteres');
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
        const mensajeExito = respuesta.mensaje || '✅ Usuario creado correctamente';
        this.mostrarMensaje('exito', mensajeExito);
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        const mensajeError = error?.error?.mensaje || '❌ No se pudo crear el usuario';
        this.mostrarMensaje('error', mensajeError);
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
