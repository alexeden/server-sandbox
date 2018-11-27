import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { AnimationClockService } from '@app/dotstar/animation-clock.service';
import { Bound, CanvasForm, CanvasSpace, Pt } from 'pts';
import { skipWhile, takeUntil, sample } from 'rxjs/operators';
import { Colors, mapToRange, clamp } from '@app/dotstar/lib';
import { LeapPaintService } from '../leap-paint.service';

@Component({
  selector: 'dotstar-leap-paint-canvas',
  templateUrl: './leap-paint-canvas.component.html',
  styleUrls: [ './leap-paint-canvas.component.scss' ],
})
export class LeapPaintCanvasComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound());

  readonly height = 550;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
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

    this.form = new CanvasForm(this.space);

    this.space.add({
      resize: () => {
        console.log('resize event!');
        this.bounds$.next(this.space.innerBound);
      },
      start: () => this.bounds$.next(this.space.innerBound),
    });

  }

  ngOnInit() {
    (window as any).renderCount = 0;
    this.paintService.latestFrame.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      sample(this.clock.t)
    )
    .subscribe(({ interactionBox, hands }) => {
      this.space.clear();
      const { height: iBoxH, width: iBoxW, center: iBoxCenter } = interactionBox;
      const iBoxCenterY = iBoxCenter[1];
      const [ p1, p2 ] = this.space.innerBound;
      const mapToCanvasSpaceX = (n: number) => mapToRange(-iBoxW / 2, iBoxW / 2, p1.x, p2.x, n);
      const mapToCanvasSpaceY = (n: number) => mapToRange(iBoxCenterY - iBoxH / 2, iBoxCenterY + iBoxH / 2, p2.y, p1.y, n);

      (window as any).renderCount++;
      hands.forEach(({
        stabilizedPalmPosition: stablePalm,
        palmPosition: palm,
        pitch,
        roll,
        pinchStrength,
        palmWidth,
        sphereRadius,
      }) => {
        const stablePalmPt = new Pt(mapToCanvasSpaceX(stablePalm[0]), mapToCanvasSpaceY(stablePalm[1]));
        const hue = clamp(0, 360)(Math.floor(mapToRange(60, -20, 0, 359, pitch * 180 / Math.PI)));
        const radius = mapToRange(palmWidth / 2, 2 * palmWidth, 10, 50, clamp(palmWidth / 2, 2 * palmWidth)(sphereRadius));

        this.form.fillOnly(`hsl(${hue}, 100%, 50%)`).point(stablePalmPt, radius);
        this.form.fill('#777').text(stablePalmPt.$add(25, 0), `[${Math.round(stablePalm[0])}, ${Math.round(stablePalm[1])}]`);
        this.form.fill('#777').text(stablePalmPt.$add(25, -15), `Pitch ${Math.round(pitch * 180 / Math.PI)}`);
        this.form.fill('#777').text(stablePalmPt.$add(25, -30), `Roll  ${Math.round(roll * 180 / Math.PI)}`);
        this.form.fill('#777').text(stablePalmPt.$add(25, -45), `Palm Radius  ${Math.round(sphereRadius)}`);
        this.form.fill('#777').text(stablePalmPt.$add(25, -60), `Pinch  ${Math.round(pinchStrength * 100)}%`);
        this.form.fill('#777').text(stablePalmPt.$add(25, -75), `Palm Width  ${Math.round(palmWidth)}`);
      });

      this.form.fill('#777').paragraphBox(
        this.space.innerBound,
        JSON.stringify(interactionBox, null, 2),
        1
      );

    });

  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
