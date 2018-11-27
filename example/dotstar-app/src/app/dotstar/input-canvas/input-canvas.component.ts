import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { share, distinctUntilChanged, filter, takeUntil, skipUntil, skipWhile, map, tap, take } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Num, Bound, Group, World, Particle } from 'pts';
import { Sample, range, Colors, clamp, mapToRange } from '../lib';
// import { DotstarBufferService } from '../dotstar-buffer.service';
import { DotstarDeviceConfigService } from '../device-config.service';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { PhysicsConfigService } from '../pointer-particles/physics-config.service';

type ActionType = 'move' | 'up' | 'down' | 'drag' | 'over' | 'out';

interface Action {
  type: ActionType;
  pt: Pt;
}

interface ParticleSnapshot {
  readonly position: Pt;
  readonly changed: Pt;
  readonly id: string;
  readonly mass: number;
  readonly force: Pt;
}

@Component({
  selector: 'dotstar-input-canvas',
  templateUrl: './input-canvas.component.html',
  styleUrls: ['./input-canvas.component.scss'],
})
export class InputCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly time$ = new BehaviorSubject(0);
  private readonly ftime$ = new BehaviorSubject(0);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound(Pt.make(2), Pt.make(2)));
  private readonly actions$ = new Subject<Action>();
  private readonly particles$ = new Subject<ParticleSnapshot[]>();
  private readonly mappedValues: Observable<Sample[]>;

  readonly height = 550;
  readonly world: Observable<World>;
  readonly bounds: Observable<Bound>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarDeviceConfigService,
    readonly bufferService: DotstarBufferService,
    readonly physicsConfig: PhysicsConfigService
  ) {
    console.log(this.physicsConfig);

    (window as any).inputCanvas = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true));
    this.form = new CanvasForm(this.space);

    this.space.setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });

    this.space.add({
      animate: (t, ft) => {
        this.time$.next(t);
        this.ftime$.next(ft);
      },
      resize: bounds => this.bounds$.next(bounds),
      start: bounds => this.bounds$.next(bounds),
      action: (type: ActionType, px, py) => this.actions$.next({ type, pt: new Pt(px, py) }),
    });

    this.bounds = this.bounds$.asObservable().pipe(
      filter(bounds => bounds.length === 2),
      distinctUntilChanged((b1, b2) => b1.p1.equals(b2.p1) && b2.p2.equals(b2.p2)),
      share()
    );

    this.world = combineLatest(
      this.configService.length,
      this.bounds,
      (n, bounds) => {
        const friction = 0.9;
        const world = new World(this.space.innerBound, friction, 10);
        range(0, n).forEach(i => {
          const part = new Particle([ Num.mapToRange(i, 0, n, 0, bounds.width || 1), 0 ]);
          part.radius = 0;
          part.id = i;
          part.mass = 5;
          world.add(part);
        });
        return world;
      }
    );

    this.mappedValues = this.particles$.pipe(
      map(particles =>
        // Map each particle to a sample triplet
        particles.map<Sample>(p => {
          const brightness = mapToRange(0, this.space.height, 0xFF, 0x00, p.position.y);
          return p.changed.y > 0
            ? [0, 0, brightness]
            : [brightness, 0, 0];
        })
      )
    );
  }

  ngOnInit() {
    const parabola = (x: number) => -0.005 * Math.pow(x, 2) + this.space.height;

    combineLatest(this.ftime$, this.world).pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue())
    )
    .subscribe(([ftime, world]) => {
      const pointer = this.space.pointer;
      const { height } = this.space;
      const particles: ParticleSnapshot[] = [];
      world.drawParticles((p, i) => {
        const color = Colors.Black;
        // [Colors.Red, Colors.Green, Colors.Blue][i % 3];
        const fy = (height - p.y + pointer.y) - parabola(p.x - pointer.x);
        p.addForce(0, 50 * fy);
        p.y = clamp(0, height)(p.y);
        particles.push({
          position: new Pt([p.x, p.y]),
          force: p.force.clone(),
          mass: p.mass,
          id: p.id,
          changed: p.changed,
        });
        this.form.fillOnly(color).point(p, 5, 'circle');
      });
      world.update(ftime);
      this.particles$.next(particles);
    });

    this.space.bindMouse().bindTouch().play();
    this.bufferService.setSource(this.mappedValues);
  }

  ngOnDestroy() {
    this.space.removeAll();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.particles$.unsubscribe();
    this.ready$.unsubscribe();
    this.time$.unsubscribe();
    this.ftime$.unsubscribe();
    this.bounds$.unsubscribe();
    this.actions$.unsubscribe();
  }
}
