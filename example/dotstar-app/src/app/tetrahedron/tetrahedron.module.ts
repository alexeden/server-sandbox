import { NgModule, RendererFactory2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared';
import { PerspectiveCamera, WebGLRenderer, Clock, Scene } from 'three';
import { SceneUtils } from './lib/scene.utils';
import CameraControls from 'camera-controls';
import { TetraCanvasComponent } from './tetra-canvas/tetra-canvas.component';



@NgModule({
  declarations: [
    TetraCanvasComponent,
  ],
  exports: [
    TetraCanvasComponent,
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
      useFactory: (rendererFactory: RendererFactory2) => {
        return rendererFactory.createRenderer(null, null).createElement('canvas');
      },
    },
    {
      provide: CameraControls,
      deps: [PerspectiveCamera, HTMLCanvasElement],
      useFactory: (camera: PerspectiveCamera, canvas: HTMLCanvasElement) => {
        return SceneUtils.createCameraControls(camera, canvas);
      },
    },
    {
      provide: WebGLRenderer,
      deps: [HTMLCanvasElement],
      useFactory: (canvas: HTMLCanvasElement) => {
        return SceneUtils.createRenderer(canvas);
      },
    },
    {
      provide: Scene,
      useFactory: () => new Scene(),
    },
    {
      provide: Clock,
      useFactory: () => new Clock(),
    },
  ],
})
export class TetrahedronModule { }
