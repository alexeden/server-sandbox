import 'hammerjs'; // tslint:disable-line:no-import-side-effect
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// import * as r from 'ramda';
// import * as glMatrix from 'gl-matrix';
// import * as physics from './app/lib/physics';
// (window as any).r = r;
// (window as any).physics = physics;
// (window as any).glMatrix = glMatrix;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
