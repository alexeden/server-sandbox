import { CommonModule } from '@angular/common';
import { NgModule, RendererFactory2 } from '@angular/core';
import { SharedModule } from '@app/shared';
import CameraControls from 'camera-controls';
import * as THREE from 'three';
// eslint-disable-next-line no-duplicate-imports
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { GeometryService } from './geometry.service';
import { HedronCanvasComponent } from './hedron-canvas/hedron-canvas.component';
import { HedronMainComponent } from './hedron-main.component';

@NgModule({
  declarations: [HedronCanvasComponent, HedronMainComponent],
  exports: [HedronCanvasComponent, HedronMainComponent],
  imports: [CommonModule, SharedModule],
  providers: [
    // Camera
    {
      provide: PerspectiveCamera,
      useFactory: () => {
        const camera = new PerspectiveCamera(45, 1, 0.1, 10);
        camera.position.set(0.7, 1, 3);

        return camera;
      },
    },
    {
      provide: HTMLCanvasElement,
      deps: [RendererFactory2],
      useFactory: (rendererFactory: RendererFactory2) =>
        rendererFactory.createRenderer(null, null).createElement('canvas'),
    },
    // Camera Controls
    {
      provide: CameraControls,
      deps: [PerspectiveCamera, HTMLCanvasElement],
      useFactory: (camera: PerspectiveCamera, canvas: HTMLCanvasElement) => {
        CameraControls.install({ THREE });
        const controls = new CameraControls(camera, canvas);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.49;
        controls.minDistance = 0.5;
        controls.maxDistance = 6;
        controls.setTarget(0, 0, 0);

        return controls;
      },
    },
    {
      provide: WebGLRenderer,
      deps: [HTMLCanvasElement],
      useFactory: (canvas: HTMLCanvasElement) => {
        console.debug('Creating THREE renderer');
        const context = canvas.getContext('webgl2') as WebGLRenderingContext;
        const renderer = new WebGLRenderer({
          antialias: true,
          canvas,
          context,
        });
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio((window && window.devicePixelRatio) || 2);

        return renderer;
      },
    },
    // Scene
    {
      provide: Scene,
      useFactory: () => {
        const scene = new Scene();
        scene.background = new Color('#303030');
        return scene;
      },
    },
    GeometryService,
  ],
})
export class HedronModule {}
