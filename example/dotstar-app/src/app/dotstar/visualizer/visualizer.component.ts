import { Component, OnInit, ElementRef, HostBinding, AfterViewInit, Renderer2 } from '@angular/core';
import { CanvasSpace, Create, Pt, CanvasForm } from 'pts';
import { DotstarConfigService } from '../dotstar-config.service';

@Component({
  selector: 'dotstar-visualizer',
  template: '',
  styleUrls: ['./visualizer.component.scss'],
})
export class DotstarVisualizerComponent implements OnInit, AfterViewInit {
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  @HostBinding('style.height') height = '500px';

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly configService: DotstarConfigService
  ) {
    this.canvas = this.renderer.createElement('canvas');

    (window as any).visualizer = this;
    console.log(this.canvas);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => console.log('READYYYYYYYYYY'));
    this.form = new CanvasForm(this.space);
    console.log(this.space.element);
    console.log(this.space.ctx);
  }

  ngOnInit() {
    this.space.setup({
      bgcolor: '#ffffff',
      resize: true,
      retina: true,
    });
    let points: any;

    this.space.add({
      start: (bound, space) => {
        const distribution = [
          new Pt(0, this.space.center.y),
          new Pt(this.space.width, this.space.center.y),
        ];
        points = Create.distributeLinear(distribution, 144);
      },
      animate: () => {
        this.form.fill('#ff006a').stroke(false).points(points, 3, 'circle');
      },
    });

    this.space.playOnce();

  }

  ngAfterViewInit() {
  }

}
