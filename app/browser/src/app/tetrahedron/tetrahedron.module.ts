import { CommonModule } from '@angular/common';
import { NgModule, RendererFactory2 } from '@angular/core';
import { SharedModule } from '@app/shared';
import CameraControls from 'camera-controls';
import * as THREE from 'three';
// eslint-disable-next-line no-duplicate-imports
import { Color, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { CanvasService } from './canvas.service';
import { GeometryService } from './geometry.service';
import { TetraCanvasComponent } from './tetra-canvas/tetra-canvas.component';
import { TetraMainComponent } from './tetra-main.component';

@NgModule({
  declarations: [TetraCanvasComponent, TetraMainComponent],
  exports: [TetraCanvasComponent, TetraMainComponent],
  imports: [CommonModule, SharedModule],
  providers: [
    // Camera
    {
      provide: PerspectiveCamera,
      useFactory: () => {
        const camera = new PerspectiveCamera(55, 1, 10, 9000);
        camera.position.set(-1000, 250, 800);

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
        controls.minDistance = 1;
        controls.maxDistance = camera.far;
        controls.setTarget(0, 150, 0);

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
    CanvasService,
    GeometryService,
  ],
})
export class TetrahedronModule {}
