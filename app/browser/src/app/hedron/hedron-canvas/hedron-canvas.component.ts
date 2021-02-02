import {
  Component,
  OnInit,
  ElementRef,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Color,
  PointLight,
  AmbientLight,
} from 'three';
import { tap, takeUntil, map, switchMap, startWith } from 'rxjs/operators';
import CameraControls from 'camera-controls';
import { GeometryService } from '../geometry.service';
import { ClockService } from '@app/clock.service';
import { Subject, Observable, fromEvent } from 'rxjs';
import { BufferService } from '@app/buffer.service';
import { name, edges } from '../geometries/icosahedron.json';
import { HedronUtils } from '../lib';
import { GeometryData } from '../lib/geometry.types';

console.log(
  HedronUtils.hedronFromGeometryData({ name, edges } as GeometryData)
);

@Component({
  selector: 'hedron-canvas',
  template: '',
  styleUrls: ['./hedron-canvas.component.scss'],
})
export class HedronCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly colorBuffer: Observable<Color[]>;

  constructor(
    private readonly bufferService: BufferService,
    private readonly camera: PerspectiveCamera,
    private readonly cameraControls: CameraControls,
    private readonly canvas: HTMLCanvasElement,
    private readonly clock: ClockService,
    private readonly elRef: ElementRef,
    private readonly geoService: GeometryService,
    private readonly renderer: WebGLRenderer,
    private readonly renderer2: Renderer2,
    private readonly scene: Scene
  ) {
    this.renderer2.appendChild(this.elRef.nativeElement, this.canvas);
    this.scene.add(...HedronCanvasComponent.createLights());

    this.colorBuffer = this.bufferService.values.pipe(
      map(rgbs => rgbs.map(([r, g, b]) => new Color().setRGB(r, g, b)))
    );
  }

  ngOnInit() {
    /**
     * Handle resize events and resize the canvas.
     */
    /** Canvas's resize bounding client rectangle */
    fromEvent(window, 'resize')
      .pipe(
        startWith(this.canvas),
        map(() => this.canvas.getBoundingClientRect() as DOMRect),
        takeUntil(this.unsubscribe$),
        tap(() => {
          const hostRect = this.elRef.nativeElement!.getBoundingClientRect();
          this.renderer.setSize(hostRect.width, hostRect.height);
          this.camera.aspect = hostRect.width / hostRect.height;
          this.camera.updateProjectionMatrix();
        })
      )
      .subscribe();

    this.geoService.model
      .pipe(
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
    this.clock.t.pipe(takeUntil(this.unsubscribe$)).subscribe(([, dt]) => {
      if (this.cameraControls.enabled) this.cameraControls.update(dt);
      this.renderer.render(this.scene, this.camera);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

  // Lights
  static createLights() {
    const ambientLight = new AmbientLight(0xffffff, 0.001);

    const pointLightLocations = [
      [100, 2000 - 50, 0],
      [100, 0, 2000],
      [100, -2000, 2000],
      [100, 2000, 2 * 2000],
      [-2000, 0, 0],
    ];

    const pointLights = pointLightLocations.map(([x, y, z]) => {
      const light = new PointLight(new Color('#ffffff'), 0.01, 0);
      light.decay = 0.1;
      light.position.set(x, y, z);
      light.castShadow = true;

      return light;
    });

    return [ambientLight, ...pointLights];
  }
}
