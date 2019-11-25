import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Scene, WebGLRenderer, PerspectiveCamera, Color } from 'three';
import { tap, takeUntil, map, switchMap } from 'rxjs/operators';
import CameraControls from 'camera-controls';
import { CanvasService } from '../canvas.service';
import { SceneUtils } from '../lib';
import { GeometryService } from '../geometry.service';
import { AnimationClockService } from '@app/animation-clock.service';
import { Subject, Observable } from 'rxjs';
import { BufferService } from '@app/buffer.service';

@Component({
  selector: 'dotstar-tetra-canvas',
  templateUrl: './tetra-canvas.component.html',
  styleUrls: ['./tetra-canvas.component.scss'],
})
export class TetraCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly colorBuffer: Observable<Color[]>;

  constructor(
    private readonly bufferService: BufferService,
    private readonly camera: PerspectiveCamera,
    private readonly cameraControls: CameraControls,
    private readonly canvas: HTMLCanvasElement,
    private readonly canvasService: CanvasService,
    private readonly clock: AnimationClockService,
    private readonly elRef: ElementRef,
    private readonly geoService: GeometryService,
    private readonly renderer: WebGLRenderer,
    private readonly renderer2: Renderer2,
    private readonly scene: Scene
  ) {
    (window as any).tetraCanvasComponent = this;
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.scene.add(...SceneUtils.createLights(), ...SceneUtils.createScenePlatform());

    this.colorBuffer = this.bufferService.values.pipe(
      map(rgbs => rgbs.map(([r, g, b]) => new Color().setRGB(r, g, b)))
    );
  }

  ngOnInit() {
    /**
     * Handle resize events and resize the canvas.
     */
    this.canvasService.canvasRect.pipe(
      takeUntil(this.unsubscribe$),
      tap(() => {
        const hostRect = this.elRef.nativeElement!.getBoundingClientRect();
        this.renderer.setSize(hostRect.width, hostRect.height);
        this.camera.aspect = hostRect.width / hostRect.height;
        this.camera.updateProjectionMatrix();
      })
    )
    .subscribe();

    this.geoService.tetraModel.pipe(
      takeUntil(this.unsubscribe$),
      /** TODO: Dispose of the old model before adding a new one */
      switchMap(model => {
        this.scene.add(model);

        return this.colorBuffer.pipe(
          tap(colors => model.applyColors(colors))
        );
      })
    )
    .subscribe();

    /**
     * Render
     */
    this.clock.dt.pipe(takeUntil(this.unsubscribe$)).subscribe(dt => {
      if (this.cameraControls.enabled) this.cameraControls.update(dt);
      this.renderer.render(this.scene, this.camera);
    });

    /**
     * Start the canvas service.
     */
    this.canvasService.start();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
