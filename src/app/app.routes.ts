import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { authGuardRedirect } from '@bookstore-app/shared-lib';

export const routes: Routes = [
  {
    path: 'account',
    canActivate: [authGuardRedirect('/login')],
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.account,
      exposedModule: './routes'

    }).then(m => m.routes)
  },
  {
    path: 'catalog',
    canActivate: [authGuardRedirect('/login')],
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.catalog,
      exposedModule: './routes'

    }).then(m => m.routes)
  },
  {
    path: 'login',
    loadComponent: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.account,
      exposedModule: './LoginComponent'
    }).then(m => m.LoginComponent)
  },
];
