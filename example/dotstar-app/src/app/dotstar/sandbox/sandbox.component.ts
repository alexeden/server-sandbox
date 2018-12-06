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
    this.space = new CanvasSpace(this.canvas, () => this.ready$.next(true))
      .setup({ bgcolor: '#ffffff', resize: true, retina: true })
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
        p => p.V.negate().multiply(0.05),
        p => Vector3.of(bounds.center.x, bounds.center.y, 0).minus(p.X).setMagnitude(500),
      ])
    );
  }

  ngOnInit() {
    range(0, 100).map(i => {
      this.system.particles.push(new Particle({
        X: Vector3.random().multiply(this.height / 2).add(this.height / 2),
        V: Vector3.random().setMagnitude(20),
        mass: Math.ceil(20 * Math.random()),
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
        this.form.strokeOnly(Colors.Blue).line([p.X.asArray(), p.X.add(p.V).asArray()]);
        this.form.strokeOnly(Colors.Green).line([p.X.asArray(), p.X.add(p.A).asArray()]);
        this.form.fillOnly(Colors.Red).point(new Pt(p.X), 5, 'circle');
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next('done!');
    this.unsubscribe$.unsubscribe();
  }

}
