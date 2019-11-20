import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { CanvasService } from '../canvas.service';
import { SceneUtils } from '../lib/scene.utils';
import { Scene, WebGLRenderer, PerspectiveCamera, Clock } from 'three';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import CameraControls from 'camera-controls';
import { tap } from 'rxjs/operators';
import { GeometryService } from '../geometry.service';

@Component({
  selector: 'dotstar-tetra-canvas',
  templateUrl: './tetra-canvas.component.html',
  styleUrls: ['./tetra-canvas.component.scss'],
})
export class TetraCanvasComponent implements OnInit {

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: PerspectiveCamera,
    private readonly cameraControls: CameraControls,
    private readonly renderer: WebGLRenderer,
    private readonly canvasService: CanvasService,
    private readonly clock: Clock,
    private readonly scene: Scene,
    readonly geoService: GeometryService
  ) {

    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.scene.add(...SceneUtils.createLights(), ...SceneUtils.createScenePlatform());
  }

  ngOnInit() {
    this.canvasService.start();

    // this.canvasService.canvasRect.pipe(
    //   tap(rect => {
    //     this.renderer2.setAttribute(this.canvas, 'height', `${2 * rect.height}`);
    //     this.renderer2.setStyle(this.canvas, 'height', `${rect.height}px`);
    //     this.renderer2.setAttribute(this.canvas, 'width', `${2 * rect.width}`);
    //     this.renderer2.setStyle(this.canvas, 'width', `${rect.width}px`);
    //   })
    // )
    // .subscribe();

    /** Render */
    /* TODO: ADD AN UNSUBSCRIBE EMITTER HERE */
    interval(0, animationFrame).subscribe(() => {
      if (this.cameraControls.enabled) this.cameraControls.update(this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
    });
  }

}
