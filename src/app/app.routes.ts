import { loadRemoteModule } from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.account,
      exposedModule: './routes'

    }).then(m => m.routes)
  },
  {
    path: 'catalog',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.catalog,
      exposedModule: './routes'

    }).then(m => m.routes)
  }
];
