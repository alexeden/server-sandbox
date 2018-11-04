import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APA102C } from 'dotstar-node/dist/apa102c';
import { DotstarConfig } from 'dotstar-node/dist/types';

@Injectable()
export class DotstarConfigService {

  private readonly deviceConfig$ = new BehaviorSubject<DotstarConfig>({
    devicePath: '/dev/null',
    dataMode: 0,
    length: 144,
    clockSpeed: APA102C.CLK_MAX,
    startFrames: 1,
    endFrames: 4,
  });

  readonly deviceConfig: Observable<DotstarConfig>;

  constructor() {
    this.deviceConfig = this.deviceConfig$.asObservable();
  }

  updateConfig(config: Partial<DotstarConfig>) {
    this.deviceConfig$.next({
      ...this.deviceConfig$.getValue(),
      ...config,
    });
  }
}
