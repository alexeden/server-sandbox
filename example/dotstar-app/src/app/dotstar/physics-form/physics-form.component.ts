import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { startWith, filter, tap, takeUntil, take, switchMapTo } from 'rxjs/operators';
import { PhysicsConfigService } from '../physics-config.service';
import { PHYSICAL_CONSTS, PhysicsConfig } from '../lib';

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

  constructor(
    private readonly fb: FormBuilder,
    private readonly physicsConfigService: PhysicsConfigService
  ) {
    // Dynamically generate the physical constant form controls
    this.physicsForm = this.fb.group({});
    this.physicalConstList.forEach(({ name, default: defaultValue, min, max }) => {
      const validators = [ Validators.min(min), Validators.max(max) ];
      const control = this.fb.control(defaultValue, validators);
      this.physicsForm.addControl(name, control);
    });

    this.physicsConfig = this.physicsForm.valueChanges.pipe(
      filter(() => this.physicsForm.valid)
    );
  }

  ngOnInit() {
    this.physicsConfigService.physicsConfig.pipe(
      take(1),
      tap(config => this.physicsForm.setValue(config)),
      switchMapTo(this.physicsConfig),
      takeUntil(this.unsubscribe$)
    )
    .subscribe(this.physicsConfigService.updateConfig.bind(this.physicsConfigService));
  }

  ngOnDestroy() {
    this.unsubscribe$.next('unsubscribe!');
    this.unsubscribe$.unsubscribe();
  }
}
