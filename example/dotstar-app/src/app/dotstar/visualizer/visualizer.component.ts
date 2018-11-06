import { Component, OnInit, ElementRef, HostBinding, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { CanvasSpace, Create, Pt, CanvasForm, Num, Bound, Group } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { range, Sample } from '../lib';
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

  private readonly bounds = new BehaviorSubject<Bound>(new Bound());
  private readonly mapToCanvasSpace: Observable<(value: number) => number>;
  private readonly mappedSamples: Observable<Sample[]>;

  private readonly ptGroups: Observable<[Group, Group, Group]>;

  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  @HostBinding('style.height') height = '500px';

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService,
    readonly socketService: DotstarSocketService,
    readonly bufferService: DotstarBufferService
  ) {
    (window as any).visualizer = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, (...args: any[]) => console.log('READYYYYYYYYYY', ...args));
    this.form = new CanvasForm(this.space);

    this.mapToCanvasSpace = this.bounds.pipe(
      map(bounds => value => {
        const offset = 20;
        const height = bounds.height - offset;
        return height + (offset / 2) - Num.mapToRange(value, 0x00, 0xff, 0, height - offset);
      })
    );

    this.ptGroups = combineLatest(this.bounds, this.configService.length).pipe(
      map(([ bounds, length ]): [Group, Group, Group] => {
        const p1 = new Pt(bounds.width * 0.02, bounds.height);
        const p2 = new Pt(bounds.width * 0.98, bounds.height);
        const distribution = Create.distributeLinear([p1, p2], length);
        return [ distribution.clone(), distribution.clone(), distribution.clone() ];
      })
    );

    this.mappedSamples = combineLatest(this.bufferService.channelValues, this.mapToCanvasSpace).pipe(
      map(([ samples, mapper ]) => samples.map<Sample>(([r, g, b]) => [mapper(r), mapper(g), mapper(b)]))
    );
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#fafafa',
      resize: true,
      retina: true,
    });

    combineLatest(this.ptGroups, this.mappedSamples).pipe(
      takeUntil(this.unsubscribe$),
      map(([[r, g, b], samples]) => ({
        r: r.map((pt, i) => pt.to([ pt.x, samples[i][0] ])),
        g: g.map((pt, i) => pt.to([ pt.x, samples[i][1] ])),
        b: b.map((pt, i) => pt.to([ pt.x, samples[i][2] ])),
      }))
    )
    .subscribe(({ r, g, b }) => {
      if (!this.form.ready) return;

      this.space.clear();
      this.form.fill(Colors.Red).stroke(false).points(r, 3, 'circle');
      this.form.fill(Colors.Green).stroke(false).points(g, 3, 'circle');
      this.form.fill(Colors.Blue).stroke(false).points(b, 3, 'circle');

      const p1 = new Pt(this.space.width * 0.02, 3);
      const p2 = new Pt(this.space.width * 0.98, 3);

      const colorStrings = range(0, r.length).map((_, i) => `rgb(${r[i]}, ${g[i]}, ${b[i]})`);
      (window as any).colorStrings = colorStrings;
      const distribution = Create.distributeLinear([p1, p2], r.length);
      distribution.map((pt, i) => this.form.fill(colorStrings[i]).stroke(false).point(pt, 4, 'square'));
    });

    this.bufferService.channelValues.pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe(samples => {
      this.socketService.sendSamples(samples);
    });

    this.space.add({
      resize: bounds => this.bounds.next(bounds),
      start: bounds => this.bounds.next(bounds),
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
