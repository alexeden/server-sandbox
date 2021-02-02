import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { GeometryUtils, Hedron, HedronGroup, HedronUtils } from './lib';

@Injectable()
export class GeometryService {
  private readonly hedron$ = new BehaviorSubject<Hedron>(
    HedronUtils.hedronFromGeometryData(
      GeometryUtils.generateIcosahedronGeometryData(20)
    )
  );

  readonly model: Observable<HedronGroup>;

  constructor() {
    this.model = this.hedron$.pipe(map(HedronGroup.ofHedron), shareReplay(1));
  }

  setHedron(hedron: Hedron) {
    this.hedron$.next(hedron);
  }
}
