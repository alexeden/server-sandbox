import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { AnimationClockService } from '@app/dotstar/animation-clock.service';
import { Bound, CanvasForm, CanvasSpace, Pt, World, Num, Particle, Color } from 'pts';
import { skipWhile, takeUntil, sample, map, withLatestFrom, tap, take } from 'rxjs/operators';
import { Colors, mapToRange, clamp, range, Sample, normalize, clampLoop } from '@app/dotstar/lib';
import { LeapPaintService } from '../leap-paint.service';
import { DotstarDeviceConfigService } from '@app/dotstar/device-config.service';
import { DotstarBufferService } from '@app/dotstar/dotstar-buffer.service';
import { Hand, InteractionBox } from '@app/leap';
import { LeapPhysicsConfigService } from '../leap-physics-config.service';

@Component({
  selector: 'dotstar-leap-paint-canvas',
  templateUrl: './leap-paint-canvas.component.html',
  styleUrls: [ './leap-paint-canvas.component.scss' ],
})
export class LeapPaintCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly bounds$: BehaviorSubject<Bound>;
  readonly height = 550;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;
  readonly world: Observable<World>;

  private readonly particles$ = new Subject<{ particles: Particle[] }>();
  private readonly mappedValues: Observable<Sample[]>;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarDeviceConfigService,
    readonly bufferService: DotstarBufferService,
    readonly paintService: LeapPaintService,
    readonly physicsService: LeapPhysicsConfigService,
    readonly clock: AnimationClockService
  ) {

    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true)).setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });
    this.bounds$ = new BehaviorSubject<Bound>(this.space.innerBound);

    this.world = combineLatest(
      this.bounds$,
      this.configService.length,
      (bounds, n) => {
        const friction = 0.8;
        const world = new World(bounds, friction, 2000);
        range(0, n).forEach(i => {
          const part = new Particle([ Num.mapToRange(i, 0, n, 0, bounds.width || 1), bounds.height, 0 ]);
          part.radius = 0;
          part.id = `${i}`;
          part.mass = 1;
          world.add(part);
        });
        return world;
      }
    );

    this.form = new CanvasForm(this.space);

    this.space.add({
      resize: () => this.bounds$.next(this.space.innerBound),
      start: () => this.bounds$.next(this.space.innerBound),
    });

    this.mappedValues = this.particles$.pipe(
      map(({ particles }) => {
        const bounds = this.bounds$.getValue();
        const l = (y: number) => clamp(0, 1, 1 - normalize(0, bounds.height, y));
        return particles.map<Sample>(p => {
          const hsl = Color.hsl(p.z || 0, 1, 0.5 * l(p.y));
          const rgb = Color.HSLtoRGB(hsl);
          return [rgb.x, rgb.y, rgb.z];
        });
      })
    );
  }

  ngOnInit() {

    this.clock.dt.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      withLatestFrom(
        this.bounds$,
        this.paintService.latestFrame,
        this.world,
        this.physicsService.physicsConfig
      ),
      tap(() => this.space.clear())
    )
    .subscribe(([dt, bounds, { interactionBox: iBox, hands }, world, { pointerForce, particleMass, friction, gravity, damping }]) => {
      world.damping = damping;
      world.friction = friction;
      world.gravity = new Pt([0, gravity]);
      const particles: Particle[] = [];
      if (hands.length > 0) {

        const iBoxCenterY = iBox.center[1];
        const mapToCanvasSpaceX = (n: number) => mapToRange(-iBox.width / 2, iBox.width / 2, bounds[0].x, bounds[1].x, n);
        const mapToCanvasSpaceY = (n: number) => mapToRange(
          iBoxCenterY - iBox.height / 2,
          iBoxCenterY + iBox.height / 2,
          bounds[1].y,
          bounds[0].y,
          n
        );

        const [ hand ] = hands;
        const stablePalmPt = new Pt(
          mapToCanvasSpaceX(hand.palmPosition[0]),
          mapToCanvasSpaceY(hand.palmPosition[1])
        );

        const spread = Math.min(1, Math.max(0.05, hand.pinchStrength)) / 5;
        const parabola = (x: number, y: number) => -1 * spread * Math.pow(x, 2) + this.space.height;
        const hue = LeapPaintCanvasComponent.hueFromRoll(hand.roll);
        world.drawParticles((p, i) => {
          p.mass = particleMass;
          const decay = parabola(p.x - stablePalmPt.x, stablePalmPt.y);
          const fy = (bounds.height - p.y + stablePalmPt.y) - decay;
          if (decay >= 0 && fy < 0) {
            p.addForce(0, pointerForce * fy);
            p.z = hue;
          }

          this.form.fillOnly(`hsl(${p.z}, 100%, 50%)`).point(p, 5, 'circle');
          particles.push(p);
        });

        const radius = Math.max(0.1, 1 - hand.pinchStrength) * 50;
        this.form.fillOnly(`hsl(${hue}, 100%, 50%)`).point(stablePalmPt, radius, 'circle');
        this.form.fillOnly('#777').text(stablePalmPt, `${spread}`);
      }
      else {
        world.drawParticles((p, i) => {
          p.mass = particleMass;
          this.form.fillOnly(`hsl(${p.z}, 100%, 50%)`).point(p, 5, 'circle');
          particles.push(p);
        });
      }
      world.update(dt);
      this.particles$.next({ particles });

    // tslint:disable-next-line:max-line-length
    //   hands.forEach(({ stabilizedPalmPosition: stablePalm, palmPosition: palm, pitch, roll, pinchStrength, palmWidth, sphereRadius, }) => {
    //     const stablePalmPt = new Pt(mapToCanvasSpaceX(stablePalm[0]), mapToCanvasSpaceY(stablePalm[1]));
    //     const radius = Math.max(0.1, 1 - pinchStrength) * 50;

    //     this.form.fillOnly(`hsl(${hue}, 100%, 50%)`).point(stablePalmPt, radius);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, 0), `[${Math.round(stablePalm[0])}, ${Math.round(stablePalm[1])}]`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -15), `Pitch ${Math.round(pitch * 180 / Math.PI)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -30), `Roll  ${Math.round(roll * 180 / Math.PI)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -45), `Palm Radius  ${Math.round(sphereRadius)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -60), `Pinch  ${Math.round(pinchStrength * 100)}%`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -75), `Palm Width  ${Math.round(palmWidth)}`);
    //   });
    });

    this.bufferService.setSource(this.mappedValues);
  }

  static hueFromRoll(roll: number) {
    return clampLoop(0, 360, Math.floor(mapToRange(60, -30, 0, 359, roll * 180 / Math.PI)));
  }

  static hueFromPitch(pitch: number) {
    return clampLoop(0, 360, Math.floor(mapToRange(80, -20, 0, 359, pitch * 180 / Math.PI)));
  }

  static hueFromDepth(depth: number, z: number) {
    return clampLoop(0, 360, Math.floor(mapToRange(-depth, depth, 0, 360, z)));
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
