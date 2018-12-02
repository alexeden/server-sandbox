import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt, Group } from 'pts';
import { Particle, V3, PhysicsUtils } from '@app/lib';
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

    this.space.add({
      animate: (t, dt) => {
        // const forces = [
        //   () => vec3.fromValues(0, 10, 0),
        // ];

        // // if (particle.i < 50) {
        // forces.push(() => vec3.fromValues(25, 0, 0));
        // }

        const change = particle.next(
          dt / 1000,
          [ () => vec3.fromValues(15, 20, 0) ],
          // forces,
          [
            PhysicsUtils.verticalWall(10),
            PhysicsUtils.verticalWall(250),
            PhysicsUtils.horizontalWall(10),
            PhysicsUtils.horizontalWall(250),
          ]
        );

        particle.apply(change);

        this.form.fillOnly('red').point(new Pt(particle.X), 9);
        // this.form.fillOnly('red').point(new Pt(particle._X), 1);
        // this.form.font(10).fillOnly('black').alignText('start', 'hanging')
        //   .text([0, 0], `Vx ${V3.round(particle.v)[0]}`)
        //   .text([0, 10], `Vy ${V3.round(particle.v)[1]}`)
        //   .text([0, 20], `Xx ${V3.round(particle.X)[0]}`)
        //   .text([0, 30], `Xy ${V3.round(particle.X)[1]}`);

        this.form.strokeOnly('black').rect(Group.from([[10, 10, 0], [250, 250, 0]]));
      },
    });

    this.space.play();
  }

}
