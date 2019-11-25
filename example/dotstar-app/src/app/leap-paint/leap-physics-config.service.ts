import { Injectable } from '@angular/core';
import { Observable, Subject, ConnectableObservable, interval, Scheduler } from 'rxjs';
import { startWith, tap, scan, map, publishReplay, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { LocalStorage } from '@app/shared';
import { PhysicsConfig, DEFAULT_PHYSICS_CONFIG, PhysicalConstName } from './lib';

@Injectable()
export class LeapPhysicsConfigService {

  private readonly configUpdates$ = new Subject<Partial<PhysicsConfig>>();
  readonly physicsConfig: ConnectableObservable<PhysicsConfig>;
  readonly worldClock: Observable<number>;

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

    this.worldClock = this.streamPhysicalConst(PhysicalConstName.WorldClock).pipe(
      startWith(this.savedPhysicsConfig.worldClock),
      switchMap(period =>
        (startTime => interval(period).pipe(
          map(() => Scheduler.now() - startTime)
        ))(Scheduler.now())
      )
    );


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
