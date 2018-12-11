import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, skipWhile, map, tap, withLatestFrom, scan, startWith, take, share } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Bound, World } from 'pts';
import { Sample, range, clamp, mapToRange, absDiff, PhysicalConstName, DotstarConstants, Colors } from '../lib';
import { DotstarDeviceConfigService } from '../device-config.service';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { AnimationClockService } from '../animation-clock.service';
import { PhysicsConfigService } from '../physics-config.service';
import { Particle, System, Vector3, Constraints, Force, Forces } from '@app/lib/physics';

type ActionType = 'move' | 'up' | 'down' | 'drag' | 'over' | 'out';

interface Action {
  type: ActionType;
  pt: Pt;
  evt: Event;
}

interface Domains {
  sysX: number[];
  sysY: number[];
  canX: number[];
  canY: number[];
  sysRatio: number;
  canRatio: number;
  toSysX: (n: number) => number;
  toSysY: (n: number) => number;
  toCanX: (n: number) => number;
  toCanY: (n: number) => number;
}

type MapRanges = Record<'toCanX' | 'toCanY' | 'toSysX' | 'toSysY', (x: number) => number>;

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
  // private readonly particles$ = new Subject<Particle[]>();
  // private readonly mappedValues: Observable<Sample[]>;
  private readonly domains: Observable<Domains>;
  private readonly pointers: Observable<Vector3[]>;

  readonly height = 550;
  readonly system: Observable<System>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;
  readonly pointerSpread = 30;

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

    this.system = combineLatest(
      this.configService.length,
      this.bounds$,
      this.physicsService.streamPhysicalConst(PhysicalConstName.ParticleMass),
      (n, bounds, mass) => {
        const system = (window as any).system = new System();
        system.particles = range(0, n).map(i => {
          return new Particle({
            mass,
            X: Vector3.of(i, 0, 0),
            V: Vector3.empty(),
          });
        });
        return system;
      }
    )
    .pipe(share());

    this.domains = combineLatest(
      this.configService.length,
      this.bounds$,
      (n, { topLeft, bottomRight }) => ({
        sysX: [ 0, n ],
        sysY: [ DotstarConstants.minBrightness, DotstarConstants.maxBrightness ],
        canX: [ topLeft.x, bottomRight.x ],
        canY: [ bottomRight.y, topLeft.y ],
      })
    )
    .pipe(
      map(ranges => ({
        ...ranges,
        sysRatio: absDiff(ranges.sysX[0], ranges.sysX[1]) / absDiff(ranges.sysY[0], ranges.sysY[1]),
        canRatio: absDiff(ranges.canX[0], ranges.canX[1]) / absDiff(ranges.canY[0], ranges.canY[1]),
        toSysX: mapToRange(ranges.canX[0], ranges.canX[1], ranges.sysX[0], ranges.sysX[1]),
        toSysY: mapToRange(ranges.canY[0], ranges.canY[1], ranges.sysY[0], ranges.sysY[1]),
        toCanX: mapToRange(ranges.sysX[0], ranges.sysX[1], ranges.canX[0], ranges.canX[1]),
        toCanY: mapToRange(ranges.sysY[0], ranges.sysY[1], ranges.canY[0], ranges.canY[1]),
      }))
    );

    this.pointers = this.actions$.pipe(
      withLatestFrom(this.domains),
      scan<[Action, MapRanges], Vector3[]>(
        (pointers, [action, domains]) => {
          switch (action.type) {
            case 'out': return [];
            default: return [
              Vector3.of(domains.toSysX(action.pt.x), domains.toSysY(action.pt.y), 0),
            ];
          }
        },
        []
      ),
      startWith([])
    );
  }

  ngOnInit() {
    this.physicsService.worldClock.pipe(
      takeUntil(this.unsubscribe$),
      withLatestFrom(
        this.system,
        this.pointers,
        this.domains,
        this.physicsService.physicsConfig
      )
    )
    .subscribe(([t, system, pointers, domains, physics]) => {
      const { fluidDensity, pointerForce, particleMass, friction, gravity, damping } = physics;
      let iters = 20;
      const dt = 1 / iters;

      while (iters--) {
        const forces: Force[] = [
          () => Vector3.of(0, gravity, 0),
          Forces.drag(fluidDensity),
        ];

        if (pointers.length > 0) {
          const [ pointer ] = pointers;
          forces.push(p => {
            return pointer
              .minus(p.X)
              .times([1, domains.sysRatio, 1])
              .setMagnitude(Math.abs(pointerForce));
          });
        }

        system.next(dt, forces, [
          Constraints.horizontalWall(domains.sysY[0], 0.6),
          Constraints.horizontalWall(domains.sysY[1], 0.1),
        ]);
      }

    });


    this.clock.t.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      withLatestFrom(
        this.system,
        this.bounds$,
        this.pointers,
        this.domains,
        this.physicsService.physicsConfig
      ),
      tap(() => this.space.clear())
    )
    .subscribe(([t, system, bounds, pointers, domains]) => {
      (window as any).system = system;

      const positions: number[] = [];
      system.particles.forEach((p, i) => {
        const position = p.X.apply(domains.toCanX, domains.toCanY, z => z);
        const velocity = p.V.apply(domains.toCanX, domains.toCanY, z => z);
        const accel = p.A.apply(domains.toCanX, domains.toCanY, z => z);
        this.form.strokeOnly(Colors.Blue).line([position.asArray(), position.add([0, velocity.y, 0]).asArray()]);
        this.form.strokeOnly(Colors.Red).line([position.asArray(), position.add(velocity).asArray() ]);
        this.form.strokeOnly(Colors.Green).line([position.asArray(), position.add([0, accel.y, 0]).asArray()]);
        this.form.fillOnly(`#3f3f3f`).point(position.asArray(), 3, 'circle');
        positions.push(p.X.y);
      });

      this.form.alignText('left', 'hanging').fill('blue')
        .text([10, 10], `y average ${positions.reduce((sum, y) => sum + y, 0) / positions.length}`, 500);
    });

  }

  ngOnDestroy() {
    this.space.removeAll();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.actions$.unsubscribe();
    this.ready$.unsubscribe();
    this.bounds$.unsubscribe();
  }
}
