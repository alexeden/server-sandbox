import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt, Group } from 'pts';
import { Particle, V3, PhysicsUtils, Force } from '@app/lib';
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
    const particle = new Particle(vec3.fromValues(20, 20, 0), 1);
    const a = 10;
    const b = 250;
    const cog = vec3.fromValues(b - a, b - a, b - a);
    const gravity: Force = p => {
      const r = vec3.squaredDistance(p.X, cog);
      // vec3.length(vec3.subtract(vec3.create(), p.X, cog));
      return vec3.scale(vec3.create(), vec3.subtract(vec3.create(), cog, p.X), p.mass / r);
      // return vec3.scale(vec3.create(), vec3.subtract(vec3.create(), cog, p.X), p.mass);
    };

    this.space.add({
      animate: (t, dt) => {
        // const forces = [
        //   () => vec3.fromValues(0, 10, 0),
        // ];

        // // if (particle.i < 50) {
        // forces.push(() => vec3.fromValues(25, 0, 0));
        // }

        // const change =
        particle.next(
          t / 1000,
          [
            // () => vec3.fromValues(0.001, 0, 0),
            gravity,
          ],
          // forces,
          [
            // PhysicsUtils.verticalWall(a),
            // PhysicsUtils.verticalWall(b),
            // PhysicsUtils.horizontalWall(a),
            // PhysicsUtils.horizontalWall(b),
          ]
        );

        // particle.apply(change);

        this.form.fillOnly('red').point(new Pt(particle.X0), 2);
        this.form.fillOnly('red').point(new Pt(particle.X), 4);
        // this.form.fillOnly('red').point(new Pt(particle._X), 1);
        this.form.font(a).fillOnly('black').alignText('start', 'hanging')
          .text([0, 0], `net x ${particle.netF[0]}`)
          .text([0, a], `net y ${particle.netF[1]}`)
          .text([0, 20], `Xx ${V3.round(particle.X)[0]}`)
          .text([0, 30], `Xy ${V3.round(particle.X)[1]}`);

        this.form.strokeOnly('black').rect(Group.from([[a, a, 0], [b, b, 0]]));
      },
    });

    this.space.play();
  }

}
