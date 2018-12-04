import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt, Group } from 'pts';
import { Particle, Vector3, PhysicsUtils, Force } from '@app/lib';
import { vec3 } from 'gl-matrix';
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
    this.particle = new Particle(1);
  }

  nextFrame() {

    const a = 10;
    const b = 250;
    const cog = Vector3.of((b - a) / 2, (b - a) / 2, (b - a) / 2);


    const drag: Force = p => {
      // const dragF = p.V0.negate().normalize();
      // const speed = p.V0.magnitude();
      return p.V0.negate();
      // return dragF.multiply(speed);
    };

    const gravity: Force = p => {
      const direction = cog.minus(p.P0).normalize();
      const r = direction.magnitudeSquared();
      return direction.multiply(p.mass * 9.8).divide(r);
    };

    const t = performance.now() / 1000;
    this.particle = this.particle.next(
      t,
      [
        drag,
        gravity,
      ]
    );

    // this.space.clear();

    // this.form.fillOnly('red').point(new Pt(this.particle.X0), 2);
    this.form.fillOnly('red').point(new Pt(this.particle.P0), 4);
    const fontSize = 15;
    this.form.font(fontSize).fillOnly('black').alignText('end', 'hanging');
    [
      // `t ${t}`,
      // `t0 ${this.particle.t0}`,
      // `net x ${this.particle.netF[0]}`,
      // `net y ${this.particle.netF[1]}`,
      `Vx ${this.particle.V0.round()[0]}`,
      `Vy ${this.particle.V0.round()[1]}`,
      `Xx ${this.particle.P0.round()[0]}`,
      `Xy ${this.particle.P0.round()[1]}`,
    ]
    .forEach((text, i) => {
      this.form.text([this.width, i * fontSize], text);
    });

    this.form.strokeOnly(Colors.Green).line([this.particle.P0 as any, this.particle.V0]);
    // this.form.strokeOnly(Colors.Blue).line([this.particle.X as any, this.particle.netF]);
    this.form.strokeOnly('black').rect(Group.from([[a, a, 0], [b, b, 0]]));

  }

  ngOnInit() {
    // const particle = new Particle(vec3.fromValues(20, 20, 0), 1);
    // const a = 10;
    // const b = 250;
    // const cog = vec3.fromValues((b - a), (b - a), (b - a));
    // const gravity: Force = p => {
    //   const r = vec3.squaredDistance(p.X, cog);
    //   // vec3.length(vec3.subtract(vec3.create(), p.X, cog));
    //   return vec3.scale(vec3.create(), vec3.subtract(vec3.create(), cog, p.X), p.mass / r);
    //   // return vec3.scale(vec3.create(), vec3.subtract(vec3.create(), cog, p.X), p.mass);
    // };

    this.space.add({
      animate: this.nextFrame.bind(this),
    });
    // this.space.add({
    //   animate: (t, dt) => {
    //     // const forces = [
    //     //   () => vec3.fromValues(0, 10, 0),
    //     // ];

    //     // // if (particle.i < 50) {
    //     // forces.push(() => vec3.fromValues(25, 0, 0));
    //     // }

    //     // const change =
    //     particle.next(
    //       t / 1000,
    //       [
    //         // () => vec3.fromValues(0.001, 0, 0),
    //         gravity,
    //       ],
    //       // forces,
    //       [
    //         // PhysicsUtils.verticalWall(a),
    //         // PhysicsUtils.verticalWall(b),
    //         // PhysicsUtils.horizontalWall(a),
    //         // PhysicsUtils.horizontalWall(b),
    //       ]
    //     );

    //     // particle.apply(change);

    //     this.form.fillOnly('red').point(new Pt(particle.X0), 2);
    //     this.form.fillOnly('red').point(new Pt(particle.X), 4);
    //     // this.form.fillOnly('red').point(new Pt(particle._X), 1);
    //     this.form.font(a).fillOnly('black').alignText('start', 'hanging')
    //       .text([0, 0], `net x ${particle.netF[0]}`)
    //       .text([0, a], `net y ${particle.netF[1]}`)
    //       .text([0, 20], `Xx ${V3.round(particle.X)[0]}`)
    //       .text([0, 30], `Xy ${V3.round(particle.X)[1]}`);

    //     this.form.strokeOnly('black').rect(Group.from([[a, a, 0], [b, b, 0]]));
    //   },
    // });

    this.space.play();
  }

}
