import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PhysicsConfig, DEFAULT_PHYSICS_CONFIG } from './lib';
import { LocalStorage } from '@app/shared';
import { startWith, tap, scan } from 'rxjs/operators';

@Injectable()
export class PhysicsConfigService {

  private readonly configUpdates$ = new Subject<Partial<PhysicsConfig>>();
  readonly physicsConfig: Observable<PhysicsConfig>;

  @LocalStorage()
  private savedPhysicsConfig: PhysicsConfig;

  constructor() {
    (window as any).PhysicsConfigService = this;
    // Initialize the saved config without deleting any values in local storage
    this.savedPhysicsConfig = { ...DEFAULT_PHYSICS_CONFIG, ...(this.savedPhysicsConfig || {}) };

    this.physicsConfig = this.configUpdates$.asObservable().pipe(
      startWith(this.savedPhysicsConfig),
      scan((config, update) => ({ ...config, ...update }), this.savedPhysicsConfig),
      tap(config => this.savedPhysicsConfig = config)
    );
  }

  updateConfig(config: Partial<PhysicsConfig>) {
    this.configUpdates$.next(config);
  }
}
