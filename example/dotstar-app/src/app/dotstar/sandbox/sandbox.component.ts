import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt, Group } from 'pts';
import { Particle, Vector3, Constraints, Force } from '@app/lib';
import { Colors } from '../lib';

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

  particle: Particle;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2
  ) {
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.setStyle(this.canvas, 'width', `${this.width}px`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    const onCanvasReady = () => {
      this.ready$.next(true);
      this.nextFrame();
    };
    this.space = new CanvasSpace(this.canvas, onCanvasReady).setup({
      bgcolor: '#ffffff',
      retina: true,
    });
    this.form = new CanvasForm(this.space);
    const a = 10;
    const b = 250;
    const cog = Vector3.of((b - a) / 2, (b - a) / 2, (b - a) / 2);
    this.particle = new Particle(1, {
      P: Vector3.random().setMagnitude((b - a) / 2).add((b - a) / 2),
      V: Vector3.random().setMagnitude(20),
    });
  }

  nextFrame() {

    const a = 10;
    const b = 250;
    const cog = Vector3.of((b - a) / 2, (b - a) / 2, (b - a) / 2);


    const drag: Force = p => {
      return p.V.negate().multiply(0.1);
    };

    const gravity: Force = p => {
      const direction = cog.minus(p.P).normalize();
      return direction.multiply(100);
    };

    const t = performance.now() / 1000;
    this.particle = this.particle.next(
      t,
      [ drag, gravity ],
      [
        Constraints.verticalWall(a),
        Constraints.verticalWall(b),
        Constraints.horizontalWall(a),
        Constraints.horizontalWall(b),
      ]
    );

    this.form.fillOnly('red').point(new Pt(this.particle.P), 4);
    const fontSize = 15;
    this.form.font(fontSize).fillOnly('black').alignText('end', 'hanging');
    [ `Xx ${this.particle.P.round()[0]}`, `Xy ${this.particle.P.round()[1]}` ].forEach((text, i) => {
      this.form.text([this.width, i * fontSize], text);
    });

    this.form.strokeOnly(Colors.Green).line([this.particle.P.asArray(), this.particle.P.add(this.particle.V).asArray()]);
    this.form.strokeOnly('black').rect(Group.from([[a, a, 0], [b, b, 0]]));

  }

  ngOnInit() {
    this.space.add({
      animate: this.nextFrame.bind(this),
    });

    this.space.play();
  }

}
