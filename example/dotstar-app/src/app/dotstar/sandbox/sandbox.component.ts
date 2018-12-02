import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt } from 'pts';
import { Particle } from '@app/lib';
import { vec3 } from 'gl-matrix';

@Component({
  templateUrl: './sandbox.component.html',
  styleUrls: [ './sandbox.component.scss' ],
})
export class SandboxComponent implements OnInit {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);

  readonly height = 550;
  readonly width = 550;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2
  ) {
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.setStyle(this.canvas, 'width', `${this.width}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true)).setup({
      bgcolor: '#ffffff',
      retina: true,
    });
    this.form = new CanvasForm(this.space);
  }

  ngOnInit() {
    const particle = new Particle(vec3.fromValues(0, 100, 0), 1);

    this.space.add({
      animate: (t, dt) => {
        const change = particle.next(dt / 1000, [
          () => vec3.fromValues(0, 10, 0),
          () => vec3.fromValues(25, 0, 0),
        ]);

        particle.apply(change);

        this.form.fillOnly('red').point(new Pt(particle.x), 5);
        // this.form.fillOnly('black').text(this.space.center, `${dt}`);
      },
    });

    this.space.play();
  }

}
