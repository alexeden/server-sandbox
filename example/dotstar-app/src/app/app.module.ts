// tslint:disable-next-line: no-import-side-effect
import 'hammerjs';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';

import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { DotstarDeviceConfigService } from './device-config.service';
import { SocketService } from './socket.service';
import { SocketNotifierComponent } from './dotstar-notifiers.component';
import { VisualizerComponent } from './visualizer';
import { DeviceConfigFormComponent } from './device-config-form';
import { BufferService } from './buffer.service';
import { LeapPaintModule } from './leap-paint';
import { LiveBufferBarComponent } from './live-buffer-bar';
import { TetrahedronModule } from './tetrahedron/tetrahedron.module';

/**
 * Views
 */
import {
  ColorspaceFunctionsComponent,
  LeapPaintComponent,
} from './views';
import { TetraMainComponent } from './tetrahedron/tetra-main.component';

const appRoutes: Routes = [
  {
    path: 'functions',
    component: ColorspaceFunctionsComponent,
    data: {
      label: 'Colorspace Functions',
    },
  },
  {
    path: 'leap-paint',
    component: LeapPaintComponent,
    data: {
      label: 'Leap Paint',
    },
  },
  {
    path: 'tetrahedron',
    component: TetraMainComponent,
    data: {
      label: 'Tetrahedron',
    },
  },
  {
    path: '',
    redirectTo: 'functions',
    pathMatch: 'full',
  },
];

@NgModule({
  declarations: [
    ColorspaceFunctionsComponent,
    DeviceConfigFormComponent,
    LiveBufferBarComponent,
    SocketNotifierComponent,
    VisualizerComponent,
    ColorspaceFunctionsComponent,
    LeapPaintComponent,
    AppComponent,
  ],
  providers: [
    AnimationClockService,
    BufferService,
    DotstarDeviceConfigService,
    SocketService,
  ],
  bootstrap: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    LeapPaintModule,
    TetrahedronModule,
    RouterModule.forRoot(appRoutes),
  ],
})
export class AppModule { }
