import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, tap, share, sample, switchMapTo } from 'rxjs/operators';
import { CanvasSpace, Pt, CanvasForm, Num, Bound, Group, Curve } from 'pts';
import { transpose } from 'ramda';
import { Sample, range } from '../lib';
import { DotstarBufferService } from '../dotstar-buffer.service';
import { DotstarConfigService } from '../dotstar-config.service';

enum Colors {
  Red = '#ff2b35',
  Green = '#76ff03',
  Blue = '#00e4ff',
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
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound());

  readonly height = 550;
  // readonly channelValues: Observable<Sample[]>;
  // readonly rgbGroup: Observable<Group>;
  // readonly rgbChannelGroups: Observable<Group[]>;
  readonly points: Observable<Group>;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService
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
      animate: t => this.time$.next(t),
      resize: bounds => this.bounds$.next(bounds),
      start: bounds => this.bounds$.next(bounds),
    });

    // this.channelValues = this.bufferService.channelValues.pipe(
    //   tap(() => this.space.clear()),
    //   share()
    // );

    this.points = combineLatest(
      this.configService.length,
      this.bounds$,
      (n, { width, height }) => {
        return Group.fromPtArray(range(0, n).map(i =>
          new Pt([ Num.mapToRange(i, 0, n, 0, width || 1), height ])
        ));
      }
    );

    // this.rgbGroup = combineLatest(this.bounds$, this.channelValues).pipe(
    //   map(([{ width }, values]) =>
    //     Group.fromPtArray(values.map(([r, g, b], i) => {
    //       const pt = new Pt([ Num.mapToRange(i, 0x00, values.length, 0, width), 0 ]);
    //       pt.id = `rgb(${r}, ${g}, ${b})`;
    //       return pt;
    //     }))
    //   ),
    //   map(group => group.moveBy(0, 5).scale([1 - (10 / this.height), 0], group.centroid()))
    // );


    // this.rgbChannelGroups = combineLatest(this.bounds$, this.channelValues).pipe(
    //   map(([{ width, height }, values]) =>
    //     transpose(values).map(channel =>
    //       Group.fromArray(channel.map((value, i) => [
    //         Num.mapToRange(i, 0x00, values.length, 0, width),
    //         height - Num.mapToRange(value, 0x00, 0xff, 0, height),
    //       ]))
    //     )
    //     .map(group => group.scale(
    //       [1 - (10 / this.height), 1 - (40 / this.height)],
    //       this.space.center.$add(0, 40)
    //     ))
    //   )
    // );
  }

  ngOnInit() {
    // this.time$
    // this.points
    combineLatest(
      this.time$,
      this.points,
      (_, group) => group
    )
    // this.time$.pipe(
    //   takeUntil(this.unsubscribe$),
    //   // sample(this.time$)
    //   switchMapTo(this.points)
    // )
    .subscribe(group => {
      if (!this.ready$.getValue()) return;
      (window as any).group = group;
      this.form.fillOnly(Colors.Blue).point(this.space.pointer, 10, 'circle');

      // this.form.strokeOnly(Colors.Red, 2).line(r);
      // this.form.strokeOnly(Colors.Green, 2).line(g);
      // this.form.strokeOnly(Colors.Blue, 2).line(b);
      // this.form.fillOnly(Colors.Red).points(r, 4, 'circle');
      this.form.fillOnly(Colors.Green).points(group, 4, 'circle');
      // this.form.fillOnly(Colors.Blue).points(b, 4, 'circle');
    });

    this.space.bindMouse().bindTouch().play();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
