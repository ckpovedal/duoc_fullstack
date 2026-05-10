import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

type NivelLog = 'debug' | 'info' | 'warn' | 'error';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly clavesSensibles = [
    'authorization',
    'clave',
    'cookie',
    'direccion',
    'h_imagen',
    'imagen',
    'p_imagen',
    'password',
    'token'
  ];

  debug(origen: string, detalle?: unknown): void {
    this.escribir('debug', origen, detalle);
  }

  info(origen: string, detalle?: unknown): void {
    this.escribir('info', origen, detalle);
  }

  warn(origen: string, detalle?: unknown): void {
    this.escribir('warn', origen, detalle);
  }

  error(origen: string, detalle?: unknown): void {
    this.escribir('error', origen, detalle);
  }

  private escribir(nivel: NivelLog, origen: string, detalle?: unknown): void {
    if (!this.debeEscribir(nivel)) {
      return;
    }

    const etiqueta = `[frontend:${origen}]`;
    const detalleSeguro = detalle === undefined ? undefined : this.limpiar(detalle);

    if (detalleSeguro === undefined) {
      this.escribirSinDetalle(nivel, etiqueta);
      return;
    }

    this.escribirConDetalle(nivel, etiqueta, detalleSeguro);
  }

  private debeEscribir(nivel: NivelLog): boolean {
    if (!environment.production) {
      return true;
    }

    return nivel === 'warn' || nivel === 'error';
  }

  private escribirSinDetalle(nivel: NivelLog, etiqueta: string): void {
    if (nivel === 'debug') {
      console.debug(etiqueta);
      return;
    }

    if (nivel === 'info') {
      console.info(etiqueta);
      return;
    }

    if (nivel === 'warn') {
      console.warn(etiqueta);
      return;
    }

    console.error(etiqueta);
  }

  private escribirConDetalle(nivel: NivelLog, etiqueta: string, detalle: unknown): void {
    if (nivel === 'debug') {
      console.debug(etiqueta, detalle);
      return;
    }

    if (nivel === 'info') {
      console.info(etiqueta, detalle);
      return;
    }

    if (nivel === 'warn') {
      console.warn(etiqueta, detalle);
      return;
    }

    console.error(etiqueta, detalle);
  }

  private limpiar(valor: unknown, profundidad = 0): unknown {
    if (valor === null || valor === undefined) {
      return valor;
    }

    if (profundidad > 4) {
      return '[OBJETO]';
    }

    if (valor instanceof Error) {
      return {
        nombre: valor.name,
        mensaje: valor.message
      };
    }

    if (Array.isArray(valor)) {
      return valor.map((item) => this.limpiar(item, profundidad + 1));
    }

    if (typeof valor === 'object') {
      const resultado: Record<string, unknown> = {};

      Object.entries(valor as Record<string, unknown>).forEach(([clave, contenido]) => {
        resultado[clave] = this.esClaveSensible(clave)
          ? '[OCULTO]'
          : this.limpiar(contenido, profundidad + 1);
      });

      return resultado;
    }

    if (typeof valor === 'string' && this.esTextoRiesgoso(valor)) {
      return '[OCULTO]';
    }

    return valor;
  }

  private esClaveSensible(clave: string): boolean {
    const claveNormalizada = clave.toLowerCase();
    return this.clavesSensibles.some((claveSensible) => claveNormalizada.includes(claveSensible));
  }

  private esTextoRiesgoso(valor: string): boolean {
    return valor.startsWith('data:image/')
      || valor.startsWith('\\x')
      || valor.length > 5000;
  }
}
