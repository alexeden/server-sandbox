import { Component, OnInit, ElementRef, Renderer2, OnDestroy, HostBinding } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, tap, share, filter } from 'rxjs/operators';
import { CanvasSpace, Create, Pt, CanvasForm, Num, Bound, Group } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { Sample } from '../lib';
import { DotstarSocketService } from '../dotstar-socket.service';
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
  private readonly canvasSpaceMapFn: Observable<(value: number) => number>;
  private readonly mappedSamples: Observable<Sample[]>;
  private readonly ptDistribution: Observable<Group>;

  readonly height = 500;
  readonly channelValues: Observable<Sample[]>;
  readonly colorStrings: Observable<string[]>;
  readonly rgbPoints: Observable<Record<'r' | 'g' | 'b', Pt[]>>;
  readonly clock = new Subject<number>();
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService,
    readonly socketService: DotstarSocketService,
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

    this.colorStrings = this.channelValues.pipe(
      map(buffer => buffer.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`))
    );

    this.canvasSpaceMapFn = this.bounds$.pipe(
      map(bounds => value => {
        const offset = 20;
        const height = bounds.height - offset;
        return height + (offset / 2) - Num.mapToRange(value, 0x00, 0xff, 0, height - offset);
      })
    );

    this.ptDistribution = combineLatest(
      this.configService.length,
      this.bounds$,
      (length, { width }) => Create.distributeLinear([new Pt(width * 0.02, 0), new Pt(width * 0.98, 0)], length)
    );

    this.mappedSamples = combineLatest(
      this.channelValues,
      this.canvasSpaceMapFn,
      (values, mapper) => values.map<Sample>(([r, g, b]) => [mapper(r), mapper(g), mapper(b)])
    );

    this.rgbPoints = combineLatest(
      this.ptDistribution,
      this.mappedSamples
    )
    .pipe(
      // Make sure distribution and sample list length are equal
      // Otherwise there can be issues with old data being processed using
      // a newer distribution
      filter(([ distro, samples ]) => distro.length === samples.length),
      map(([distro, samples]) => ({
        r: distro.map((pt, i) => pt.$to([ pt.x, samples[i][0] ])),
        g: distro.map((pt, i) => pt.$to([ pt.x, samples[i][1] ])),
        b: distro.map((pt, i) => pt.$to([ pt.x, samples[i][2] ])),
      }))
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

    combineLatest(this.ptDistribution, this.colorStrings).pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(([distro, colors]) => {
      if (!this.form.ready) return;
      distro.clone().moveBy(0, 3).map((pt, i) => this.form.fill(colors[i]).stroke(false).point(pt, 4, 'square'));
    });

    this.rgbPoints.pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(({ r, g, b }) => {
      if (!this.form.ready) return;
      this.form.fill(Colors.Red).stroke(false).points(r, 3, 'circle');
      this.form.fill(Colors.Green).stroke(false).points(g, 3, 'circle');
      this.form.fill(Colors.Blue).stroke(false).points(b, 3, 'circle');
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
