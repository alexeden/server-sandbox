import { Component, OnInit, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { CanvasSpace, CanvasForm, Pt, Group, Bound } from 'pts';
import { Particle, Vector3, Constraint, Constraints, Force, System } from '@app/lib';
import { Colors, range } from '../lib';
import { AnimationClockService } from '../animation-clock.service';
import { map, takeUntil, skipWhile, withLatestFrom } from 'rxjs/operators';

@Component({
  templateUrl: './sandbox.component.html',
  styleUrls: [ './sandbox.component.scss' ],
})
export class SandboxComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();
  private readonly ready$ = new BehaviorSubject(false);
  private readonly bounds$ = new BehaviorSubject<Bound>(new Bound(Pt.make(2), Pt.make(2)));

  readonly height = 550;
  readonly width = 550;
  readonly space: CanvasSpace;
  readonly form: CanvasForm;
  readonly canvas: HTMLCanvasElement;

  readonly system = new System();
  readonly constraints: Observable<Constraint[]>;
  readonly forces: Observable<Force[]>;

  constructor(
    readonly elRef: ElementRef,
    readonly renderer: Renderer2,
    readonly clock: AnimationClockService
  ) {
    (window as any).SandboxComponent = this;
    this.canvas = this.renderer.createElement('canvas');
    this.renderer.setStyle(this.canvas, 'height', `${this.height}px`);
    this.renderer.setStyle(this.canvas, 'width', `${this.width}px`);
    this.renderer.setStyle(this.canvas, 'max-width', `100%`);
    this.renderer.appendChild(this.elRef.nativeElement, this.canvas);
    const onCanvasReady = () => {
      this.ready$.next(true);
      // this.nextFrame();
    };
    this.space = new CanvasSpace(this.canvas, onCanvasReady)
      .setup({
        bgcolor: '#ffffff',
        resize: true,
        retina: true,
      })
      .add({
        resize: () => this.bounds$.next(this.space.innerBound),
        start: () => this.bounds$.next(this.space.innerBound),
      });

    this.form = new CanvasForm(this.space);

    this.constraints = this.bounds$.asObservable().pipe(
      map(bounds => [
        Constraints.verticalWall(bounds.topLeft.x),
        Constraints.verticalWall(bounds.bottomRight.x),
        Constraints.horizontalWall(bounds.topLeft.y),
        Constraints.horizontalWall(bounds.bottomRight.y),
      ])
    );

    this.forces = this.bounds$.asObservable().pipe(
      map<Bound, Force[]>(bounds => [
        // p => p.V.negate().multiply(0.1),
        p => Vector3.of(bounds.center.x, bounds.center.y, 0).minus(p.P).normalize(),
      ])
    );
  }

  // nextFrame() {

  //   const a = 10;
  //   const b = 250;
  //   const cog = Vector3.of((b - a) / 2, (b - a) / 2, (b - a) / 2);


  //   const drag: Force = p => {
  //     return p.V.negate().multiply(0.1);
  //   };

  //   const gravity: Force = p => {
  //     const direction = cog.minus(p.P).normalize();
  //     return direction.multiply(100);
  //   };

  //   const t = performance.now() / 1000;
  //   this.particle = this.particle.next(
  //     t,
  //     [ drag, gravity ],
  //     [
  //       Constraints.verticalWall(a),
  //       Constraints.verticalWall(b),
  //       Constraints.horizontalWall(a),
  //       Constraints.horizontalWall(b),
  //     ]
  //   );

  //   this.form.fillOnly('red').point(new Pt(this.particle.P), 4);
  //   const fontSize = 15;
  //   this.form.font(fontSize).fillOnly('black').alignText('end', 'hanging');
  //   [ `Xx ${this.particle.P.round()[0]}`, `Xy ${this.particle.P.round()[1]}` ].forEach((text, i) => {
  //     this.form.text([this.width, i * fontSize], text);
  //   });

  //   this.form.strokeOnly(Colors.Green).line([this.particle.P.asArray(), this.particle.P.add(this.particle.V).asArray()]);
  //   this.form.strokeOnly('black').rect(Group.from([[a, a, 0], [b, b, 0]]));

  // }

  ngOnInit() {
    // this.space.add({
    //   animate: this.nextFrame.bind(this),
    // });

    // this.space.play();
    const bounds = this.bounds$.getValue();
    range(0, 100).map(i => {
      this.system.particles.push(new Particle(1, {
        P: Vector3.of(100, 100, 0),
        // P: Vector3.random().add(bounds.width / 2),
        V: Vector3.random().setMagnitude(20),
      }));
    });

    this.clock.t.pipe(
      takeUntil(this.unsubscribe$),
      skipWhile(() => !this.ready$.getValue()),
      withLatestFrom(this.forces, this.constraints)
    )
    .subscribe(([t, forces, constraints]) => {
      this.space.clear();
      this.system.next(t / 1000, forces, constraints);
      this.system.particles.forEach(p => {
        this.form.fillOnly('red').point(new Pt(p.P), 4);
        this.form.strokeOnly(Colors.Green).line([p.P.asArray(), p.P.add(p.V).asArray()]);
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('done!');
    this.unsubscribe$.unsubscribe();
  }

}
