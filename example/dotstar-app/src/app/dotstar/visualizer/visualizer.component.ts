import { Component, OnInit, ElementRef, HostBinding, Renderer2, OnDestroy } from '@angular/core';
import { CanvasSpace, Create, Pt, CanvasForm, Color } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';
import { Subject } from 'rxjs';

enum Colors {
  Red = '#ff2b35',
  Green = '#76ff03',
  Blue = '#00e4ff',
}

@Component({
  selector: 'dotstar-visualizer',
  template: '',
  styleUrls: ['./visualizer.component.scss'],
})
export class DotstarVisualizerComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

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
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });

    let points: any;
    let temp: any;

    this.space.add({
      start: (bound, space) => {
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
        temp = {
          r: distribution.clone(),
          g: distribution.clone(),
          b: distribution.clone(),
        };
      },
      animate: () => {
        const pointer = this.space.pointer;
        // const pointerMag = pointer.magnitude();
        // const redPoints = points.r.map((p: Pt) => {
        //   // const mag =
        //   return p.$to({ y: p.y - })
        // });

        this.form.fill(Colors.Red).stroke(false).points(points.r, 3, 'circle');
        this.form.fill(Colors.Green).stroke(false).points(points.g, 3, 'circle');
        this.form.fill(Colors.Blue).stroke(false).points(points.b, 3, 'circle');
        this.form.fill('#333').stroke(false).point(pointer, 5, 'square');
      },
    });

    this.space.bindMouse().play();

  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
