import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, skipWhile, map, tap, withLatestFrom, scan } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Bound, World } from 'pts';
import { Sample, range, clamp, mapToRange, absDiff, PhysicalConstName, DotstarConstants, Colors } from '../lib';
import { DotstarDeviceConfigService } from '../device-config.service';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { AnimationClockService } from '../animation-clock.service';
import { PhysicsConfigService } from '../physics-config.service';
import { Particle, System, Vector3, Constraints, Force } from '@app/lib/physics';

type ActionType = 'move' | 'up' | 'down' | 'drag' | 'over' | 'out';

interface Action {
  type: ActionType;
  pt: Pt;
  evt: Event;
}

type MapRanges = Record<'canvasX' | 'canvasY' | 'systemX' | 'systemY', (x: number) => number>;

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
  private readonly mapTos: Observable<MapRanges>;
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
          });
        });
        return system;
      }
    );

    this.mapTos = combineLatest(
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
      map(({ sysX, sysY, canX, canY }) => ({
        systemX: mapToRange(canX[0], canX[1], sysX[0], sysX[1]),
        systemY: mapToRange(canY[0], canY[1], sysY[0], sysY[1]),
        canvasX: mapToRange(sysX[0], sysX[1], canX[0], canX[1]),
        canvasY: mapToRange(sysY[0], sysY[1], canY[0], canY[1]),
      }))
    );

    this.pointers = this.actions$.pipe(
      withLatestFrom(this.mapTos),
      scan<[Action, MapRanges], Vector3[]>(
        (pointers, [action, mapTos]) => {
          switch (action.type) {
            case 'out': return [];
            default: return [
              Vector3.of(
                mapTos.systemX(action.pt.x),
                mapTos.systemY(action.pt.y),
                0
              ),
            ];
          }
        },
        []
      )
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
        this.mapTos,
        this.physicsService.physicsConfig
        // this.physicsService.streamPhysicalConst(PhysicalConstName.PointerForce),
        // this.physicsService.streamPhysicalConst(PhysicalConstName.ParticleMass),
        // this.physicsService.streamPhysicalConst(PhysicalConstName.Friction),
        // this.physicsService.streamPhysicalConst(PhysicalConstName.Gravity),
        // this.physicsService.streamPhysicalConst(PhysicalConstName.Damping)
      ),
      tap(() => this.space.clear())
    )
    .subscribe(([t, system, bounds, pointers, mapTo, { pointerForce, particleMass, friction, gravity, damping }]) => {
      const { minBrightness, maxBrightness } = DotstarConstants;
      const { height, width } = bounds;

      // const mapToCanvasX = mapToRange(0, system.particles.length, bounds.topLeft.x, bounds.bottomRight.x);
      // const mapToCanvasY = mapToRange(minBrightness, maxBrightness, bounds.bottomRight.y, bounds.topLeft.y);
      // const pointerSpread = Math.pow((width / system.particleCount) * this.pointerSpread, 2);
      // const forceDecayX = (dx: number) => clamp(0, 1, -1 * Math.pow(dx, 2) / pointerSpread + 1);
      const forces: Force[] = [
        () => Vector3.of(0, gravity, 0),
      ];

      if (pointers.length > 0) {
        const [ pointer ] = pointers;
        this.form.alignText('left').fill(Colors.Black).text([10, 10], `Pointer\t ${pointers[0].round().asArray()}`, 500);
        forces.push(
          p => {
            const diff = pointer.minus(p.X);
            return diff.setMagnitude(10 * diff.y / Math.abs(diff.x));
            // .setMagnitude(200 / Math.pow(diff.x, 2)); // .divide(0.01 * diff.magnitudeSquared());
          });
      }


      system.next(t / 1000, forces, [
        Constraints.horizontalWall(minBrightness, 0.2),
        Constraints.horizontalWall(maxBrightness),
        Constraints.axisLock('x'),
      ]);

      system.particles.forEach((p, i) => {
        const position = p.X.apply(mapTo.canvasX, mapTo.canvasY, z => z);
        const velocity = p.V.apply(mapTo.canvasX, mapTo.canvasY, z => z);
        const accel = p.A.apply(mapTo.canvasX, mapTo.canvasY, z => z);
        this.form.strokeOnly(Colors.Blue).line([position.asArray(), position.add(velocity).asArray()]);
        this.form.strokeOnly(Colors.Green).line([position.asArray(), position.add(accel).asArray()]);

        this.form.fillOnly(`#3f3f3f`).point(position.asArray(), 5, 'circle');
      });

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
