import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

import { LoggerService } from '../services/logger.service';

export const httpLoggerInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const inicio = performance.now();

  return next(req).pipe(
    tap({
      next: (evento) => {
        if (evento instanceof HttpResponse) {
          logger.debug('http', {
            metodo: req.method,
            ruta: limpiarRuta(req.urlWithParams),
            estado: evento.status,
            duracionMs: Math.round(performance.now() - inicio)
          });
        }
      },
      error: (error: unknown) => {
        const httpError = error as HttpErrorResponse;

        logger.error('http', {
          metodo: req.method,
          ruta: limpiarRuta(req.urlWithParams),
          estado: httpError.status || 'sin respuesta',
          mensaje: httpError.message,
          duracionMs: Math.round(performance.now() - inicio)
        });
      }
    })
  );
};

function limpiarRuta(url: string): string {
  return url.split('?')[0];
}
