import { Component, OnInit, ElementRef, HostBinding, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map, pluck } from 'rxjs/operators';
import { CanvasSpace, Create, Pt, CanvasForm, Num, Color, Bound, Group } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { range, Channels, ChannelSamplers, Sampler } from '../lib';
import { DotstarSocketService } from '../dotstar-socket.service';

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
  private readonly samplers = new Subject<ChannelSamplers>();
  private readonly clock = new Subject<number>();
  private readonly bounds = new BehaviorSubject<Bound>(new Bound());
  private readonly mapToCanvasSpace: Observable<(value: number) => number>;
  private readonly channelValues: Observable<Record<Channels | 'rgb', number[]>>;
  private readonly channelGroups: Observable<Record<Channels, Group>>;
  private readonly bufferedChannels: Observable<number[]>;
  readonly colorStrings: Observable<string[]>;

  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  @HostBinding('style.height') height = '500px';

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService,
    readonly socketService: DotstarSocketService
  ) {
    (window as any).visualizer = this;
    (window as any).Num = Num;

    this.canvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => console.log('READYYYYYYYYYY'));
    this.form = new CanvasForm(this.space);

    this.mapToCanvasSpace = this.bounds.pipe(
      map(bounds => value => {
        const offset = 20;
        const height = bounds.height - offset;
        return height + (offset / 2) - Num.mapToRange(value, 0x00, 0xff, 0, height - offset);
      })
    );

    this.channelValues = combineLatest(
      this.clock,
      this.configService.length.pipe(map(n => range(0, n).fill(0))),
      this.samplers
    ).pipe(
      map(([t, buffer, fns]) => {
        t /= 1000;
        const r = buffer.map((_, i) => fns.r(t, i, buffer.length));
        const g = buffer.map((_, i) => fns.g(t, i, buffer.length));
        const b = buffer.map((_, i) => fns.b(t, i, buffer.length));
        const rgb = buffer.map((_, i) => (r[i] << 16) | (g[i] << 8) | b[i]);
        (window as any).rgb = rgb;
        return { r, g, b, rgb };
      })
    );

    this.bufferedChannels = this.channelValues.pipe(pluck('rgb'));

    this.colorStrings = this.channelValues.pipe(
      map(({ r, g, b, rgb }) =>
        range(0, r.length).map((_, i) =>
          `rgb(${rgb[i] >> 16 & 0xFF}, ${(rgb[i] >> 8) & 0xFF}, ${rgb[i] & 0xFF})`
        )
      )
    );

    this.channelGroups = combineLatest(this.bounds, this.configService.length).pipe(
      map(([ bounds, length ]) => {
        const p1 = new Pt(bounds.width * 0.02, bounds.height);
        const p2 = new Pt(bounds.width * 0.98, bounds.height);
        const distribution = Create.distributeLinear([p1, p2], length);
        return {
          r: distribution.clone(),
          g: distribution.clone(),
          b: distribution.clone(),
        };
      })
    );
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#fafafa',
      resize: true,
      retina: true,
    });

    combineLatest(this.channelValues, this.channelGroups, this.mapToCanvasSpace, this.colorStrings).pipe(
      takeUntil(this.unsubscribe$),
      map(([values, { r, g, b }, mapSpace, colorStrings]) => {
        return {
          r: r.map((pt, i) => pt.to([ pt.x, mapSpace(values.r[i]) ])),
          g: g.map((pt, i) => pt.to([ pt.x, mapSpace(values.g[i]) ])),
          b: b.map((pt, i) => pt.to([ pt.x, mapSpace(values.b[i]) ])),
          colorStrings,
        };
      })
    )
    .subscribe(({ r, g, b, colorStrings }) => {
      (window as any).r = r;
      this.form.fill(Colors.Red).stroke(false).points(r, 3, 'circle');
      this.form.fill(Colors.Green).stroke(false).points(g, 3, 'circle');
      this.form.fill(Colors.Blue).stroke(false).points(b, 3, 'circle');

      const p1 = new Pt(this.space.width * 0.02, 3);
      const p2 = new Pt(this.space.width * 0.98, 3);
      const distribution = Create.distributeLinear([p1, p2], r.length);
      distribution.map((pt, i) => this.form.fill(colorStrings[i]).stroke(false).point(pt, 4, 'square'));
    });

    this.channelValues.pipe(
      takeUntil(this.unsubscribe$),
      map(({ rgb }) => rgb)
    )
    .subscribe(buffer => {
      this.socketService.sendBuffer(buffer);
    });

    this.space.add({
      resize: bounds => this.bounds.next(bounds),
      start: bounds => this.bounds.next(bounds),
      animate: t => this.clock.next(t),
    });

    this.space.bindMouse().play(1000);
  }

  handleFunctionUpdate({ r, g, b }: ChannelSamplers) {
    const clampWrap = (fn: Sampler) => (...args: Parameters<Sampler>) => Math.floor(Num.clamp(fn(...args), 0x00, 0xff));
    this.samplers.next({
      r: clampWrap(r),
      g: clampWrap(g),
      b: clampWrap(b),
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
