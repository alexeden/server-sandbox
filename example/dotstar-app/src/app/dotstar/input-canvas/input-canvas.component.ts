import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, skipWhile, map, tap, withLatestFrom, scan, startWith } from 'rxjs/operators';
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
        const system = new System();
        system.particles = range(0, n).map(i => {
          return new Particle({
            mass,
            X: Vector3.of(i, 0, 0),
            V: Vector3.empty(),
          });
        });
        return system;
      }
    );

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
              Vector3.of(
                domains.toSysX(action.pt.x),
                domains.toSysY(action.pt.y),
                0
              ),
            ];
          }
        },
        []
      ),
      startWith([])
    );

    // this.mappedValues = this.particles$.pipe(
    //   map(particles => {
    //     const mapToBrightness = mapToRange(0, this.space.height, 0xFF, 0x00);
    //     // Map each particle to a sample triplet
    //     return particles.map<Sample>(p => {
    //       const brightness = mapToBrightness(p.y);
    //       return p.changed.y > 0
    //         ? [0, 0, brightness]
    //         : [brightness, 0, 0];
    //     });
    //   })
    // );

  }

  ngOnInit() {
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
    .subscribe(([t, system, bounds, pointers, mapTo, { fluidDensity, pointerForce, particleMass, friction, gravity, damping }]) => {
      (window as any).system = system;
      const { minBrightness, maxBrightness } = DotstarConstants;
      const forces: Force[] = [
        () => Vector3.of(0, gravity, 0),
        Forces.drag(fluidDensity),
      ];

      if (pointers.length > 0) {
        const [ pointer ] = pointers;
        this.form.alignText('left').fill(Colors.Black).text([10, 10], `Pointer\t ${pointers[0].round().asArray()}`, 500);
        forces.push(p => {
          // const diff =
          return pointer.minus(p.X).setMagnitude(Math.abs(pointerForce)); // .setX(0);
          // return diff.setMagnitude(diff.y / Math.abs(diff.x));
          // .setMagnitude(200 / Math.pow(diff.x, 2)); // .divide(0.01 * diff.magnitudeSquared());
        });
      }

      // forces.push(p => {
      //   return p.
      // });


      system.next(t / 1000, forces, [
        Constraints.horizontalWall(minBrightness, 0.2),
        Constraints.horizontalWall(maxBrightness, 0.1),
        // Constraints.axisLock('x'),
      ]);

      const positions: number[] = [];
      let maxV = 0;
      system.particles.forEach((p, i) => {
        const position = p.X.apply(mapTo.toCanX, mapTo.toCanY, z => z);
        const velocity = p.V.apply(mapTo.toCanX, mapTo.toCanY, z => z);
        maxV = Math.max(maxV, velocity.magnitude());
        const accel = p.A.apply(mapTo.toCanX, mapTo.toCanY, z => z);
        this.form.strokeOnly(Colors.Blue).line([position.asArray(), position.add([0, velocity.y, 0]).asArray()]);
        this.form.strokeOnly(Colors.Red).line([position.asArray(), position.add(velocity).asArray() ]);
        this.form.strokeOnly(Colors.Green).line([position.asArray(), position.add([0, accel.y, 0]).asArray()]);
        positions.push(p.X.y);
        this.form.fillOnly(`#3f3f3f`).point(position.asArray(), 3, 'circle');
      });

      this.form.alignText('left', 'hanging').fill('blue')
        .text([10, 10], `y average ${positions.reduce((sum, y) => sum + y, 0) / positions.length}`, 500);

      // system.drawParticles((particle, i) => {
      //   particle.mass = particleMass;
      //   if (pointers.length > 0) {
      //     const [{ x: pointerX, y: pointerY }] = pointers;
      //     const dx = absDiff(pointerX, particle.x);
      //     const xDecay = forceDecayX(dx);
      //     const antigravity = pointerForce * xDecay;
      //     // yMag will always be a value within range [-1, 1]
      //     const yMag = xDecay * ((particle.y - pointerY) / height);
      //     const fy = antigravity <= 0
      //       ? 0
      //       : - (yMag * antigravity);

      //     if (i % 2 === 0 && fy) {
      //       this.form.alignText('left').fill('red')
      //        .text([particle.x, height - 30 - ((i % 12) * 20) ], `g ${Math.round(antigravity)}`, 500);
      //       this.form.alignText('left').fill('blue').text([particle.x, height - 15 - ((i % 12) * 20) ], `yMag ${yMag.toFixed(1)}`, 500);
      //     }
      //     particle.addForce(0, fy);
      //     this.form.fillOnly(`#3f3f3f`).point(particle, 5, 'circle');
      //     this.form.fillOnly(`red`).point([particle.x, fy + height], 3, 'circle');
      //   }
      //   else {
      //     this.form.fillOnly(`#3f3f3f`).point(particle, 5, 'circle');
      //   }
      // });
      // system.update(dt);
    });

    // this.bufferService.setSource(this.mappedValues);
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
