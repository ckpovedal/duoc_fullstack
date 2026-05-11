import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio/inicio.page').then(m => m.InicioPage)
  },
  {
    path: 'principal',
    loadComponent: () =>
      import('./pages/principal/principal.page').then(m => m.PrincipalPage)
  },
  {
    path: 'buscador',
    loadComponent: () =>
      import('./pages/buscador/buscador.page').then(m => m.BuscadorPage)
  },
  {
    path: 'mascotas-halladas',
    loadComponent: () =>
      import('./pages/hallazgos/hallazgos.page').then(m => m.HallazgosPage)
  },
  {
    path: 'hallazgos',
    redirectTo: 'mascotas-halladas',
    pathMatch: 'full'
  },
  {
    path: 'mascota-perdida/:id',
    loadComponent: () =>
      import('./pages/mascota-perdida/mascota-perdida.page')
        .then(m => m.MascotaPerdidaPage)
  },
  {
    path: 'mascota-hallada/:id',
    loadComponent: () =>
      import('./pages/mascota-hallada/mascota-hallada.page')
        .then(m => m.MascotaHalladaPage)
  },
  {
    path: 'perdidas',
    redirectTo: 'reporte-mascota',
    pathMatch: 'full'
  },
  {
    path: 'reporte-mascota',
    loadComponent: () =>
      import('./pages/reporte-mascota/reporte-mascota.page')
        .then(m => m.ReporteMascotaPage)
  },
  {
    path: 'nuevo-usuario',
    loadComponent: () =>
      import('./pages/nuevo-usuario/nuevo-usuario.page')
        .then(m => m.NuevoUsuarioPage)
  },
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.page')
        .then(m => m.MiPerfilPage)
  },
];
