import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, tap, share } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Num, Bound, Group } from 'pts';
import { transpose } from 'ramda';
import { Sample } from '../lib';
import { DotstarBufferService } from '../dotstar-buffer.service';

enum Colors {
  Red = '#ff2b35',
  Green = '#76ff03',
  Blue = '#00e4ff',
}

@Component({
  selector: 'dotstar-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.scss'],
})
export class DotstarVisualizerComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound());

  readonly height = 500;
  readonly channelValues: Observable<Sample[]>;
  readonly rgbGroup: Observable<Group>;
  readonly rgbChannelGroups: Observable<Group[]>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly bufferService: DotstarBufferService
  ) {
    (window as any).visualizer = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true));
    this.form = new CanvasForm(this.space);

    this.channelValues = this.bufferService.channelValues.pipe(
      tap(() => this.space.clear()),
      share()
    );

    this.rgbGroup = combineLatest(this.bounds$, this.channelValues).pipe(
      map(([{ width }, values]) =>
        Group.fromPtArray(values.map(([r, g, b], i) => {
          const pt = new Pt([ Num.mapToRange(i, 0x00, values.length, 0, width), 0 ]);
          pt.id = `rgb(${r}, ${g}, ${b})`;
          return pt;
        }))
      ),
      map(group => group.moveBy(0, 5).scale([1 - (10 / this.height), 0], group.centroid()))
    );

    this.rgbChannelGroups = combineLatest(this.bounds$, this.channelValues).pipe(
      map(([{ width, height }, values]) =>
        transpose(values).map(channel =>
          Group.fromArray(channel.map((value, i) => [
            Num.mapToRange(i, 0x00, values.length, 0, width),
            height - Num.mapToRange(value, 0x00, 0xff, 0, height),
          ]))
        )
        .map(group => group.scale(
          [1 - (10 / this.height), 1 - (40 / this.height)],
          this.space.center.$add(0, 40)
        ))
      )
    );
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });

    this.space.add({
      resize: bounds => this.bounds$.next(bounds),
      start: bounds => this.bounds$.next(bounds),
    });

    this.rgbGroup.pipe(takeUntil(this.unsubscribe$)).subscribe(group => {
      if (!this.ready$.getValue()) return;
      group.map((pt, i) => this.form.fill(pt.id).stroke(false).point(pt, 4, 'square'));
    });

    this.rgbChannelGroups.pipe(takeUntil(this.unsubscribe$)).subscribe(([ r, g, b ]) => {
      if (!this.ready$.getValue()) return;
      this.form.fill(Colors.Red).stroke(false).points(r, 5, 'circle');
      this.form.fill(Colors.Green).stroke(false).points(g, 5, 'circle');
      this.form.fill(Colors.Blue).stroke(false).points(b, 5, 'circle');
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
