import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { APA102C } from 'dotstar-node/dist/apa102c';
import { DotstarConfig } from 'dotstar-node/dist/types';
import { pluck, scan } from 'rxjs/operators';

@Injectable()
export class DotstarConfigService {

  private readonly deviceConfig$ = new BehaviorSubject<DotstarConfig>({
    devicePath: '',
    dataMode: 0,
    length: 144,
    clockSpeed: APA102C.CLK_MAX,
    startFrames: 1,
    endFrames: 4,
  });

  private readonly devicePaths$ = new BehaviorSubject<string[]>([]);
  readonly devicePaths: Observable<string[]>;

  readonly deviceConfig: Observable<DotstarConfig>;
  readonly length: Observable<number>;



  constructor() {
    this.deviceConfig = this.deviceConfig$.asObservable();
    this.length = this.deviceConfig.pipe(pluck('length'));

    this.devicePaths = this.devicePaths$.asObservable().pipe(
      scan((paths, newPaths) => Array.from(new Set<string[]>([...paths, ...newPaths])), [])
    );
  }

  updateConfig(config: Partial<DotstarConfig>) {
    this.deviceConfig$.next({
      ...this.deviceConfig$.getValue(),
      ...config,
    });
  }

  getConnectionQuery() {
    const config = this.deviceConfig$.getValue();
    const query = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('&');
    return `?${query}`;
  }

  async getAvailableDevicePaths(): Promise<string[]> {
    return fetch('/api/dev')
      .then(res => res.json())
      .then(({ devicePaths }) => {
        this.devicePaths$.next(devicePaths);
        return devicePaths;
      });
  }
}
