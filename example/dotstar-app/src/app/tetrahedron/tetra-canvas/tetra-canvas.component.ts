import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';
import { tap, takeUntil } from 'rxjs/operators';
import CameraControls from 'camera-controls';
import { CanvasService } from '../canvas.service';
import { SceneUtils } from '../lib';
import { GeometryService } from '../geometry.service';
import { AnimationClockService } from '@app/animation-clock.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'dotstar-tetra-canvas',
  templateUrl: './tetra-canvas.component.html',
  styleUrls: ['./tetra-canvas.component.scss'],
})
export class TetraCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer2: Renderer2,
    private readonly canvas: HTMLCanvasElement,
    private readonly camera: PerspectiveCamera,
    private readonly cameraControls: CameraControls,
    private readonly renderer: WebGLRenderer,
    private readonly canvasService: CanvasService,
    private readonly scene: Scene,
    private readonly clock: AnimationClockService,
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
    this.clock.dt.pipe(takeUntil(this.unsubscribe$)).subscribe(dt => {
      if (this.cameraControls.enabled) this.cameraControls.update(dt);
      this.renderer.render(this.scene, this.camera);
    });

    this.canvasService.start();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
