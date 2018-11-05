import { Component, OnInit, ElementRef, HostBinding, Renderer2, OnDestroy } from '@angular/core';
import { CanvasSpace, Create, Pt, CanvasForm, Num, Color, Bound, Group } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { Subject, combineLatest, BehaviorSubject, Observable } from 'rxjs';
import { AnimationFunctions } from '../animation-form/types';
import { takeUntil, map } from 'rxjs/operators';
import { range, Channels } from '../lib';

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
  private readonly animators = new Subject<AnimationFunctions>();
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

    combineLatest(
      this.clock,
      this.animators,
      this.configService.length.pipe(
        map(length => range(0, length).fill(0))
      )
    ).pipe(
      takeUntil(this.unsubscribe$),
      map(([t, { r, g, b }, buffer]) => {

      })
    )
    .subscribe();

    let points: any;

    this.space.add({
      start: (bounds, space) => {
        this.bounds.next(bounds);
        const distribution = Create.distributeLinear(
          [
            new Pt(this.space.width * 0.02, this.space.height - 10),
            new Pt(this.space.width * 0.98, this.space.height - 10),
          ],
          144
        );

        points = {
          r: distribution.clone(),
          g: distribution.clone(),
          b: distribution.clone(),
        };
      },
      animate: t => {
        const pointer = this.space.pointer;
        const w = Num.cycle((t % 1000) / 1000);
        points.r.forEach(pt => pt.y = w * this.space.height);

        this.form.fill(Colors.Red).stroke(false).points(points.r, 3, 'circle');
        this.form.fill(Colors.Green).stroke(false).points(points.g, 3, 'circle');
        this.form.fill(Colors.Blue).stroke(false).points(points.b, 3, 'circle');
        this.form.fill('#333').stroke(false).point(pointer, 5, 'square');
      },
    });

    this.space.bindMouse().play(1000);

  }

  handleFunctionUpdate(fns: AnimationFunctions) {
    this.animators.next(fns);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
