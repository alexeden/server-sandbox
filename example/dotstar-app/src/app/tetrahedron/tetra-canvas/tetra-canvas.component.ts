import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { Scene, WebGLRenderer, PerspectiveCamera, Clock } from 'three';
import { interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import CameraControls from 'camera-controls';
import { CanvasService } from '../canvas.service';
import { SceneUtils } from '../lib';
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
    (window as any).tetraCanvasComponent = this;
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.scene.add(...SceneUtils.createLights(), ...SceneUtils.createScenePlatform());
  }

  ngOnInit() {

    this.canvasService.canvasRect.pipe(
      tap(() => {
        const hostRect = this.elRef.nativeElement!.getBoundingClientRect();
        this.renderer.setSize(hostRect.width, hostRect.height);
        this.camera.aspect = hostRect.width / hostRect.height;
        this.camera.updateProjectionMatrix();
      })
    )
    .subscribe();

    this.geoService.tetraModel.pipe(

    )
    .subscribe(model => this.scene.add(model));

    /** Render */
    /* TODO: ADD AN UNSUBSCRIBE EMITTER HERE */
    interval(0, animationFrame).subscribe(() => {
      if (this.cameraControls.enabled) this.cameraControls.update(this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
    });

    this.canvasService.start();
  }

}
