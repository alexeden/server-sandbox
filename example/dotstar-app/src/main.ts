import 'hammerjs'; // tslint:disable-line:no-import-side-effect
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as pts from 'pts';
import * as rxjs from 'rxjs';
(window as any).pts = pts;
(window as any).rxjs = rxjs;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
