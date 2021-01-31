import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/shared';
import { AnimationClockService } from './animation-clock.service';
import { AppComponent } from './app.component';
import { BufferService } from './buffer.service';
import { DeviceConfigFormComponent } from './device-config-form';
import { DotstarDeviceConfigService } from './device-config.service';
import { SocketNotifierComponent } from './dotstar-notifiers.component';
import { FunctionLibraryService } from './function-library.service';
import { LiveBufferBarComponent } from './live-buffer-bar';
import { SocketService } from './socket.service';
import { TetraMainComponent } from './tetrahedron/tetra-main.component';
import { TetrahedronModule } from './tetrahedron/tetrahedron.module';
/**
 * Views
 */
import { ColorspaceFunctionsComponent } from './views';
import { VisualizerComponent } from './visualizer';


const appRoutes: Routes = [
  {
    path: 'functions',
    component: ColorspaceFunctionsComponent,
    data: {
      label: 'Colorspace Functions',
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
    AppComponent,
  ],
  providers: [
    AnimationClockService,
    BufferService,
    DotstarDeviceConfigService,
    FunctionLibraryService,
    SocketService,
  ],
  bootstrap: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    TetrahedronModule,
    RouterModule.forRoot(appRoutes),
  ],
})
export class AppModule { }
