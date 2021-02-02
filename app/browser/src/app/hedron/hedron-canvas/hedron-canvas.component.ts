import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { BufferService } from '@app/buffer.service';
import { ClockService } from '@app/clock.service';
import CameraControls from 'camera-controls';
import { fromEvent, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  // PointLight,
  AmbientLight,
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { edges, name } from '../geometries/icosahedron.json';
import { GeometryService } from '../geometry.service';
import { GeometryData, HedronUtils } from '../lib';

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
    const ambientLight = new AmbientLight(0xffffff, 0.01);

    // const pointLightLocations = [
    //   [0, 2, 0],
    //   // [0, -2, 0],
    //   // [1.5, 1.5, 0],
    //   // [1.5, 0, 1.5],
    //   // [1.5, -1.5, 1.5],
    //   // [1.5, 1.5, 1.5],
    //   // [-1.5, 0, 0],
    // ];

    // const pointLights = pointLightLocations.map(([x, y, z]) => {
    //   const light = new PointLight(new Color('#ffffff'), 0.01, 0);
    //   // light.decay = 0.001;
    //   light.position.set(x, y, z);
    //   // light.castShadow = true;

    //   return light;
    // });

    return [ambientLight]; // , ...pointLights];
  }
}
