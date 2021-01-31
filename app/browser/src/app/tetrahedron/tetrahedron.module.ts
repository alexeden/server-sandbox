import { CommonModule } from '@angular/common';
import { NgModule, RendererFactory2 } from '@angular/core';
import { SharedModule } from '@app/shared';
import CameraControls from 'camera-controls';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { CanvasService } from './canvas.service';
import { GeometryService } from './geometry.service';
import { SceneUtils } from './lib';
import { TetraCanvasComponent } from './tetra-canvas/tetra-canvas.component';
import { TetraMainComponent } from './tetra-main.component';

@NgModule({
  declarations: [
    TetraCanvasComponent,
    TetraMainComponent,
  ],
  exports: [
    TetraCanvasComponent,
    TetraMainComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  providers: [
    {
      provide: PerspectiveCamera,
      useFactory: SceneUtils.createCamera,
    },
    {
      provide: HTMLCanvasElement,
      deps: [RendererFactory2],
      useFactory: (rendererFactory: RendererFactory2) => rendererFactory.createRenderer(null, null).createElement('canvas'),
    },
    {
      provide: CameraControls,
      deps: [PerspectiveCamera, HTMLCanvasElement],
      useFactory: (camera: PerspectiveCamera, canvas: HTMLCanvasElement) => SceneUtils.createCameraControls(camera, canvas),
    },
    {
      provide: WebGLRenderer,
      deps: [HTMLCanvasElement],
      useFactory: (canvas: HTMLCanvasElement) => SceneUtils.createRenderer(canvas),
    },
    {
      provide: Scene,
      useFactory: () => SceneUtils.createScene(),
    },
    // {
    //   provide: Clock,
    //   useFactory: () => new Clock(),
    // },
    CanvasService,
    GeometryService,
  ],
})
export class TetrahedronModule { }
