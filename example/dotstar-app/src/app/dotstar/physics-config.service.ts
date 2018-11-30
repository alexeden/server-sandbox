import { Injectable } from '@angular/core';
import { Observable, Subject, ConnectableObservable } from 'rxjs';
import { PhysicsConfig, DEFAULT_PHYSICS_CONFIG, PhysicalConstName } from './lib';
import { LocalStorage } from '@app/shared';
import { startWith, tap, scan, map, publishReplay, distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class PhysicsConfigService {

  private readonly configUpdates$ = new Subject<Partial<PhysicsConfig>>();
  readonly physicsConfig: ConnectableObservable<PhysicsConfig>;

  @LocalStorage()
  private savedPhysicsConfig: PhysicsConfig;

  constructor() {
    // Initialize the saved config without deleting any values in local storage
    this.savedPhysicsConfig = { ...DEFAULT_PHYSICS_CONFIG, ...(this.savedPhysicsConfig || {}) };

    this.physicsConfig = this.configUpdates$.asObservable().pipe(
      startWith({}),
      scan((config, update) => ({ ...config, ...update }), this.savedPhysicsConfig),
      tap(config => this.savedPhysicsConfig = config),
      publishReplay(1)
    ) as ConnectableObservable<PhysicsConfig>;

    this.physicsConfig.connect();
  }

  streamPhysicalConst(name: PhysicalConstName): Observable<number> {
    return this.physicsConfig.pipe(
      map(config => config[name]),
      distinctUntilChanged()
    );
  }

  updateConfig(config: Partial<PhysicsConfig>) {
    this.configUpdates$.next(config);
  }
}
