import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  guardarSesion(usuario: any, token: string) {
    localStorage.setItem('usuario', JSON.stringify(usuario));

    const usuarioId = usuario?.idUsuario || usuario?.u_id || usuario?.U_ID;

    if (usuarioId) {
      localStorage.setItem('usuario_id', usuarioId);
    }

    if (token) {
      localStorage.setItem('token', token);
    }
  }

  actualizarUsuario(usuario: any) {
    if (!usuario) {
      return;
    }

    localStorage.setItem('usuario', JSON.stringify(usuario));

    const usuarioId = usuario?.idUsuario || usuario?.u_id || usuario?.U_ID;

    if (usuarioId) {
      localStorage.setItem('usuario_id', usuarioId);
    }
  }

  obtenerToken() {
    return localStorage.getItem('token');
  }

  obtenerUsuarioId() {
    const usuarioId = localStorage.getItem('usuario_id');

    if (usuarioId) {
      return usuarioId;
    }

    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return '';
    }

    try {
      const usuario = JSON.parse(usuarioGuardado);
      return usuario?.idUsuario || usuario?.u_id || usuario?.U_ID || '';
    } catch {
      return '';
    }
  }

  sesionActiva() {
    const token = this.obtenerToken();
    return !!token && !this.tokenExpirado(token);
  }

  tokenExpirado(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const expiracion = Number(payload.exp || 0) * 1000;

      return !expiracion || Date.now() >= expiracion;
    } catch {
      return true;
    }
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('usuario_id');
    localStorage.removeItem('token');
  }
}
