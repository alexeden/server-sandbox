import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { AnimationClockService } from '@app/dotstar/animation-clock.service';
import { Bound, CanvasForm, CanvasSpace, Pt, World, Num, Particle } from 'pts';
import { skipWhile, takeUntil, sample, map, withLatestFrom, tap } from 'rxjs/operators';
import { Colors, mapToRange, clamp, range } from '@app/dotstar/lib';
import { LeapPaintService } from '../leap-paint.service';
import { DotstarDeviceConfigService } from '@app/dotstar/device-config.service';

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

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarDeviceConfigService,
    readonly paintService: LeapPaintService,
    readonly clock: AnimationClockService
  ) {
    (window as any).LeapPaintCanvasComponent = this;
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
        const friction = 0.9;
        const world = new World(bounds, friction, 10);
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

    this.form = new CanvasForm(this.space);

    this.space.add({
      resize: () => this.bounds$.next(this.space.innerBound),
      start: () => this.bounds$.next(this.space.innerBound),
    });

  }

  ngOnInit() {
    (window as any).renderCount = 0;

    this.clock.dt.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      withLatestFrom(this.bounds$, this.paintService.latestFrame, this.world),
      tap(() => this.space.clear())
    )
    .subscribe(([dt, bounds, { interactionBox: iBox, hands }, world]) => {
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

        const [{
          stabilizedPalmPosition: stablePalm,
          pinchStrength,
        }] = hands;
        const stablePalmPt = new Pt(mapToCanvasSpaceX(stablePalm[0]), mapToCanvasSpaceY(stablePalm[1]));
        const spread = pinchStrength / 100;
        const parabola = (x: number) => -1 * spread * Math.pow(x, 2) + this.space.height;

        world.drawParticles((p, i) => {
          const color = Colors.Black;
          const fy = (bounds.height - p.y + stablePalmPt.y) - parabola(p.x - stablePalmPt.x);
          p.addForce(0, 50 * fy);
          p.y = clamp(0, bounds.height)(p.y);
          this.form.fillOnly(color).point(p, 5, 'circle');
        });
        hands.forEach(({
          stabilizedPalmPosition: stable,
          palmPosition: palm,
          pitch,
          roll,
          pinchStrength: pinch,
          palmWidth,
          sphereRadius,
        }) => {
          const stablePt = new Pt(mapToCanvasSpaceX(stable[0]), mapToCanvasSpaceY(stable[1]));
          const hue = clamp(0, 360)(Math.floor(mapToRange(60, -30, 0, 359, roll * 180 / Math.PI)));
          const radius = Math.max(0.1, 1 - pinch) * 50;

          this.form.fillOnly(`hsl(${hue}, 100%, 50%)`).point(stablePt, radius, 'circle');
          this.form.fill('#777').text(stablePt.$add(25, 0), `[${Math.round(stablePalm[0])}, ${Math.round(stablePalm[1])}]`);
          this.form.fill('#777').text(stablePt.$add(25, -15), `Pitch ${Math.round(pitch * 180 / Math.PI)}`);
          this.form.fill('#777').text(stablePt.$add(25, -30), `Roll  ${Math.round(roll * 180 / Math.PI)}`);
          this.form.fill('#777').text(stablePt.$add(25, -45), `Palm Radius  ${Math.round(sphereRadius)}`);
          this.form.fill('#777').text(stablePt.$add(25, -60), `Pinch  ${Math.round(pinch * 100)}%`);
          this.form.fill('#777').text(stablePt.$add(25, -75), `Palm Width  ${Math.round(palmWidth)}`);
        });

        world.update(dt);
      }

    //   const { height: iBoxH, width: iBoxW, center: iBoxCenter } = interactionBox;
    //   const iBoxCenterY = iBoxCenter[1];
    //   const [ p1, p2 ] = this.space.innerBound;
    //   const mapToCanvasSpaceX = (n: number) => mapToRange(-iBoxW / 2, iBoxW / 2, p1.x, p2.x, n);
    //   const mapToCanvasSpaceY = (n: number) => mapToRange(iBoxCenterY - iBoxH / 2, iBoxCenterY + iBoxH / 2, p2.y, p1.y, n);

    //   (window as any).renderCount++;
    //   hands.forEach(({
    //     stabilizedPalmPosition: stablePalm,
    //     palmPosition: palm,
    //     pitch,
    //     roll,
    //     pinchStrength,
    //     palmWidth,
    //     sphereRadius,
    //   }) => {
    //     const stablePalmPt = new Pt(mapToCanvasSpaceX(stablePalm[0]), mapToCanvasSpaceY(stablePalm[1]));
    //     const hue = clamp(0, 360)(Math.floor(mapToRange(60, -30, 0, 359, roll * 180 / Math.PI)));
    //     // const hue = clamp(0, 360)(Math.floor(mapToRange(60, -20, 0, 359, pitch * 180 / Math.PI)));
    //     // const radius = mapToRange(palmWidth / 2, 2 * palmWidth, 10, 50, clamp(palmWidth / 2, 2 * palmWidth)(sphereRadius));
    //     const radius = Math.max(0.1, 1 - pinchStrength) * 50;

    //     this.form.fillOnly(`hsl(${hue}, 100%, 50%)`).point(stablePalmPt, radius);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, 0), `[${Math.round(stablePalm[0])}, ${Math.round(stablePalm[1])}]`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -15), `Pitch ${Math.round(pitch * 180 / Math.PI)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -30), `Roll  ${Math.round(roll * 180 / Math.PI)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -45), `Palm Radius  ${Math.round(sphereRadius)}`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -60), `Pinch  ${Math.round(pinchStrength * 100)}%`);
    //     this.form.fill('#777').text(stablePalmPt.$add(25, -75), `Palm Width  ${Math.round(palmWidth)}`);
    //   });

    //   this.form.fill('#777').paragraphBox(
    //     this.space.innerBound,
    //     JSON.stringify(interactionBox, null, 2),
    //     1
    //   );

    });

  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
