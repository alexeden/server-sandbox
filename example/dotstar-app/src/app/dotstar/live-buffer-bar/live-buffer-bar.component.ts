import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { AnimationClockService } from '../animation-clock.service';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { CanvasSpace, CanvasForm, Group, Pt } from 'pts';
import { tap, share, sample, map, takeUntil, skipWhile } from 'rxjs/operators';
import { mapToRange } from '../lib';

@Component({
  selector: 'dotstar-live-buffer-bar',
  templateUrl: './live-buffer-bar.component.html',
  styleUrls: [ './live-buffer-bar.component.scss' ],
})
export class LiveBufferBarComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);

  readonly height = 24;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;
  readonly rgbGroup: Observable<Group>;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly bufferService: DotstarBufferService,
    readonly clock: AnimationClockService
  ) {
    (window as any).LiveBufferBarComponent = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.setStyle(this.canvas, 'width', `100%`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true)).setup({
      bgcolor: 'black',
      resize: true,
      retina: true,
    });
    this.form = new CanvasForm(this.space);

    this.rgbGroup = this.bufferService.values.pipe(
      sample(this.clock.t),
      tap(() => this.space.clear()),
      map(values => {
        const { width } = this.space.innerBound;
        const y = this.height / 2;
        return Group.fromPtArray(values.map(([r, g, b], i) => {
          const x = mapToRange(0x00, values.length, 0, width, i);
          const pt = new Pt([ x, y ]);
          pt.id = `rgb(${r}, ${g}, ${b})`;
          return pt;
        }));
      }),
      share()
    );
  }

  ngOnInit() {
    this.rgbGroup.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue())
    ).subscribe(group => {
      group.map((pt, i) => this.form.fill(pt.id).stroke(false).point(pt, 3, 'square'));
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }

}
