import { Component, OnInit, ElementRef, HostBinding, Renderer2, OnDestroy } from '@angular/core';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { CanvasSpace, Create, Pt, CanvasForm, Num, Color, Bound, Group } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { range, Channels, ChannelAnimationFns, AnimationFn } from '../lib';

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
  private readonly animators = new Subject<ChannelAnimationFns>();
  private readonly clock = new Subject<number>();
  private readonly bounds = new BehaviorSubject<Bound>(new Bound());
  private readonly channelGroups: Observable<Record<Channels, Group>>;

  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  @HostBinding('style.height') height = '500px';

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService
  ) {
    (window as any).visualizer = this;

    this.canvas = this.renderer.createElement('canvas');
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => console.log('READYYYYYYYYYY'));
    this.form = new CanvasForm(this.space);

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

    combineLatest(this.clock, this.animators, this.channelGroups).pipe(
      takeUntil(this.unsubscribe$),
      map(([t, fns, { r, g, b }]) => {
        return {
          r: r.map((pt, i) => pt.to([ pt.x, fns.r(t, i, r.length) ])),
          g: g.map((pt, i) => pt.to([ pt.x, fns.g(t, i, r.length) ])),
          b: b.map((pt, i) => pt.to([ pt.x, fns.b(t, i, r.length) ])),
        };
      })
    )
    .subscribe(({ r, g, b }) => {
      (window as any).r = r;
      this.form.fill(Colors.Red).stroke(false).points(r, 3, 'circle');
      this.form.fill(Colors.Green).stroke(false).points(g, 3, 'circle');
      this.form.fill(Colors.Blue).stroke(false).points(b, 3, 'circle');
    });

    this.space.add({
      resize: bounds => this.bounds.next(bounds),
      start: bounds => this.bounds.next(bounds),
      animate: t => this.clock.next(t),
    });

    this.space.bindMouse().play(1000);
  }

  handleFunctionUpdate({ r, g, b }: ChannelAnimationFns) {
    const clampWrap = (fn: AnimationFn) => (...args: Parameters<AnimationFn>) => Num.clamp(fn(...args), 0x00, 0xff);
    this.animators.next({
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
