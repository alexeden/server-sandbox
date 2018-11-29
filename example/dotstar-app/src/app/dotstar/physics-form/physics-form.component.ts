import { Component, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { startWith, filter, tap } from 'rxjs/operators';
import { PhysicsConfigService } from '../physics-config.service';
import { PHYSICAL_CONSTS, PhysicsConfig, DEFAULT_PHYSICS_CONFIG } from '../lib';
import { LocalStorage } from '@app/shared';

@Component({
  selector: 'dotstar-physics-form',
  templateUrl: './physics-form.component.html',
  styleUrls: ['./physics-form.component.scss'],
})
export class PhysicsFormComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<any>();

  readonly physicsConfig: Observable<PhysicsConfig>;

  readonly physicsForm: FormGroup;
  readonly physicalConstList = Object.values(PHYSICAL_CONSTS);

  @LocalStorage()
  savedConfig: PhysicsConfig;


  constructor(
    private fb: FormBuilder,
    private readonly physicsConfigService: PhysicsConfigService
  ) {
    // Initialize the saved config without deleting any values in local storage
    this.savedConfig = { ...DEFAULT_PHYSICS_CONFIG, ...(this.savedConfig || {}) };

    this.physicsForm = this.fb.group({});

    // Dynamically generate the physical constant form controls
    this.physicalConstList.forEach(({ name, min, max }) => {
      const value = this.savedConfig[name];
      const validators = [ Validators.min(min), Validators.max(max) ];
      const control = this.fb.control(value, validators);
      this.physicsForm.addControl(name, control);
    });
    //   {
    //   friction: [0.9, [
    //     Validators.min(0),
    //     Validators.max(1),
    //   ]],
    //   gravity: [10],
    //   particleMass: [5, [Validators.min(1)]],
    //   pointerForce: [50],
    //   pointerSpread: [0.005],
    // });

    // this.fb.group.
    this.physicsConfig = this.physicsForm.valueChanges.pipe(
      startWith(this.physicsForm.value),
      filter(() => this.physicsForm.valid),
      tap(config => this.savedConfig = config)
    );
  }

  ngOnInit() {
    // this.config.subscribe(this.configUpdated);
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
