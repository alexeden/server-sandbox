import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhysicsConfig } from './types';
import { Subject, Observable } from 'rxjs';
import { startWith, filter } from 'rxjs/operators';
import { PhysicsConfigService } from '../pointer-particles/physics-config.service';

@Component({
  selector: 'dotstar-physics-form',
  templateUrl: './physics-form.component.html',
  styleUrls: ['./physics-form.component.scss'],
})
export class DotstarPhysicsFormComponent implements OnInit, OnDestroy {

  static readonly defaultConfig: PhysicsConfig = {
    friction: 0.9,
    gravity: 10,
    particleMass: 5,
    pointerForce: 50,
    pointerSpread: 0.005,
  };

  @Output() configUpdated = new Subject<PhysicsConfig>();
  private readonly unsubscribe$ = new Subject<any>();
  readonly config: Observable<PhysicsConfig>;
  readonly physicsForm: FormGroup;


  constructor(
    private fb: FormBuilder,
    private readonly physicsConfig: PhysicsConfigService
  ) {
    console.log(this.physicsConfig);
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

    this.config = this.physicsForm.valueChanges.pipe(
      startWith(this.physicsForm.value),
      filter(() => this.physicsForm.valid)
    );
  }

  ngOnInit() {
    this.config.subscribe(this.configUpdated);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
