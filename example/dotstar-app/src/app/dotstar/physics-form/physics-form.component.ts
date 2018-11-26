import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhysicsConfig } from './types';
import { Subject } from 'rxjs';

@Component({
  selector: 'dotstar-physics-form',
  templateUrl: './physics-form.component.html',
  styleUrls: ['./physics-form.component.scss'],
})
export class DotstarPhysicsFormComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  static readonly defaultConfig: PhysicsConfig = {
    friction: 0.9,
    gravity: 10,
    particleMass: 5,
    pointerForce: 50,
    pointerSpread: 0.005,
  };

  readonly physicsForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) {
    this.physicsForm = this.fb.group({
      friction: [0.9, [
        Validators.min(0),
        Validators.max(1),
      ]],
      gravity: [10],
      particleMass: [5, [Validators.min(1)]],
      pointerForce: [50],
      pointerSpread: [0.005],
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
