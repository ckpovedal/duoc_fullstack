import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../services/sesion.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const sesionService = inject(SesionService);

  if (!sesionService.sesionActiva()) {
    sesionService.cerrarSesion();
    return router.createUrlTree(['/login']);
  }

  return true;
};
