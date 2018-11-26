import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { share, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Num, Bound, Group, World, Particle } from 'pts';
import { Sample, range, Colors, clamp } from '../lib';
// import { DotstarBufferService } from '../dotstar-buffer.service';
import { DotstarDeviceConfigService } from '../device-config.service';

type ActionType = 'move' | 'up' | 'down' | 'drag' | 'over' | 'out';

interface Action {
  type: ActionType;
  pt: Pt;
}

@Component({
  selector: 'dotstar-input-canvas',
  templateUrl: './input-canvas.component.html',
  styleUrls: ['./input-canvas.component.scss'],
})
export class DotstarInputCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly time$ = new BehaviorSubject(0);
  private readonly ftime$ = new BehaviorSubject(0);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound(Pt.make(2), Pt.make(2)));
  private readonly actions$ = new Subject<Action>();

  readonly height = 550;
  readonly world: Observable<World>;
  readonly baseGroup: Observable<Group>;
  readonly bounds: Observable<Bound>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarDeviceConfigService
  ) {
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
        const gravity = [0, 10];
        const world = new World(this.space.innerBound, 0.9, gravity);
        range(0, n).forEach(i => {
          const part = new Particle([ Num.mapToRange(i, 0, n, 0, bounds.width || 1), 0 ]);
          part.radius = 0;
          part.mass = 5;
          world.add(part);
        });
        return world;
      }
    );

    this.baseGroup = combineLatest(
      this.configService.length,
      this.bounds,
      (n, { width, height }) =>
        Group.fromPtArray(range(0, n).map(i =>
          new Pt([ Num.mapToRange(i, 0, n, 0, width || 1), height ])
        ))
    );

  }

  ngOnInit() {
    combineLatest(this.ftime$, this.world)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(([ftime, world]) => {
      if (!this.ready$.getValue()) return;
      const pointer = this.space.pointer;
      const { height } = this.space;
      const parab = (x: number) => -0.005 * Math.pow(x, 2) + height;
      world.drawParticles((p, i) => {
        const color = [Colors.Red, Colors.Green, Colors.Blue][i % 3];
        const fy = (height - p.y + pointer.y) - parab(p.x - pointer.x);
        p.addForce(0, 100 * fy);
        p.y = clamp(0, height)(p.y);
        this.form.fillOnly(color).point(p, 5, 'circle');
      });
      world.update(ftime);
    });

    this.space.bindMouse().bindTouch().play();
  }

  ngOnDestroy() {
    this.space.removeAll();
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
    this.ready$.unsubscribe();
    this.time$.unsubscribe();
    this.ftime$.unsubscribe();
    this.bounds$.unsubscribe();
    this.actions$.unsubscribe();
  }
}
