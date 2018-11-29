import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { share, distinctUntilChanged, filter, takeUntil, skipUntil, skipWhile, map, tap, take, withLatestFrom, scan } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Bound, Group, World, Particle } from 'pts';
import { Sample, range, Colors, clamp, mapToRange, absDiff, PhysicalConstName } from '../lib';
import { DotstarDeviceConfigService } from '../device-config.service';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { AnimationClockService } from '../animation-clock.service';
import { PhysicsConfigService } from '../physics-config.service';

type ActionType = 'move' | 'up' | 'down' | 'drag' | 'over' | 'out';

interface Action {
  type: ActionType;
  pt: Pt;
  evt: Event;
}

@Component({
  selector: 'dotstar-input-canvas',
  templateUrl: './input-canvas.component.html',
  styleUrls: ['./input-canvas.component.scss'],
})
export class InputCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly actions$ = new Subject<Action>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound(Pt.make(2), Pt.make(2)));
  private readonly particles$ = new Subject<Particle[]>();
  private readonly mappedValues: Observable<Sample[]>;
  private readonly pointers: Observable<Pt[]>;

  readonly height = 550;
  readonly world: Observable<World>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;
  readonly friction = 0.96;
  readonly gravity = 100;
  readonly pointerGravity = 100 * this.gravity;
  readonly pointerSpread = 30;
  readonly particleMass = 1;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarDeviceConfigService,
    readonly bufferService: DotstarBufferService,
    readonly physicsService: PhysicsConfigService,
    readonly clock: AnimationClockService
  ) {

    (window as any).inputCanvas = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true))
      .bindMouse()
      .setup({ bgcolor: 'transparent', resize: true, retina: true })
      .add({
        resize: () => this.bounds$.next(this.space.innerBound),
        start: () => this.bounds$.next(this.space.innerBound),
        action: (type: ActionType, px, py, evt) => this.actions$.next({ type, pt: new Pt(px, py), evt }),
      });

    this.form = new CanvasForm(this.space);

    this.world = combineLatest(
      this.configService.length,
      this.bounds$,
      (n, bounds) => {
        const world = (window as any).world = new World(bounds, this.friction, this.gravity);
        const mapToX = mapToRange(0, n, 0, bounds.width || 1);
        range(0, n).forEach(i => {
          const part = new Particle([ mapToX(i), 0 ]);
          part.radius = 0;
          part.id = i;
          part.mass = this.particleMass;
          world.add(part);
        });
        return world;
      }
    );

    this.pointers = this.actions$.pipe(
      withLatestFrom(this.bounds$),
      scan<[Action, Bound], Pt[]>(
        (pointers, [action, bound]) => {
          // console.log(action);
          switch (action.type) {
            case 'out': return [];
            default: return [action.pt];
          }
        },
        []
      )
    );

    this.mappedValues = this.particles$.pipe(
      map(particles => {
        const mapToBrightness = mapToRange(0, this.space.height, 0xFF, 0x00);
        // Map each particle to a sample triplet
        return particles.map<Sample>(p => {
          const brightness = mapToBrightness(p.y);
          return p.changed.y > 0
            ? [0, 0, brightness]
            : [brightness, 0, 0];
        });
      })
    );

  }

  ngOnInit() {
    this.clock.dt.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      withLatestFrom(this.world, this.bounds$, this.pointers),
      tap(() => this.space.clear())
    )
    .subscribe(([dt, world, bounds, pointers]) => {
      const { height, width } = bounds;
      const particles: Particle[] = [];
      const pointerSpread = Math.pow((width / world.particleCount) * this.pointerSpread, 2);
      const forceDecayX = (dx: number) => clamp(0, 1, -1 * Math.pow(dx, 2) / pointerSpread + 1);

      world.drawParticles((particle, i) => {
        if (pointers.length > 0) {
          const [{ x: pointerX, y: pointerY }] = pointers;
          const dx = absDiff(pointerX, particle.x);
          const xDecay = forceDecayX(dx);
          const antigravity = this.pointerGravity * xDecay;
          // yMag will always be a value within range [-1, 1]
          const yMag = xDecay * ((particle.y - pointerY) / height);
          const fy = antigravity <= 0
            ? 0
            : - (yMag * antigravity);

          if (i % 2 === 0 && fy) {
            this.form.alignText('left').fill('red').text([particle.x, height - 30 - ((i % 12) * 20) ], `g ${Math.round(antigravity)}`, 500);
            this.form.alignText('left').fill('blue').text([particle.x, height - 15 - ((i % 12) * 20) ], `yMag ${yMag.toFixed(1)}`, 500);
          }
          particle.addForce(0, fy);
          this.form.fillOnly(`#3f3f3f`).point(particle, 5, 'circle');
          this.form.fillOnly(`red`).point([particle.x, fy + height], 3, 'circle');
        }
        else {
          this.form.fillOnly(`#3f3f3f`).point(particle, 5, 'circle');
        }
        // particle.y = clamp(0, height, particle.y);
        particles.push(particle);
      });
      world.update(dt);
      this.particles$.next(particles);
    });

    this.bufferService.setSource(this.mappedValues);
  }

  ngOnDestroy() {
    this.space.removeAll();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.particles$.unsubscribe();
    this.actions$.unsubscribe();
    this.ready$.unsubscribe();
    this.bounds$.unsubscribe();
  }
}
