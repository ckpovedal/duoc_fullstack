import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaEstadoService {
  private mensajesLeidosSubject = new Subject<void>();
  mensajesLeidos$ = this.mensajesLeidosSubject.asObservable();

  notificarMensajesLeidos() {
    this.mensajesLeidosSubject.next();
  }
}
