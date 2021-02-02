import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
// import { edges, name } from './geometries/icosahedron.json';
import { GeometryUtils, Hedron, HedronUtils } from './lib';
// import { GeometryData } from './lib/geometry.types';
import { HedronGroup } from './lib/hedron.group';

@Injectable()
export class GeometryService {
  private readonly hedron$ = new BehaviorSubject<Hedron>(
    HedronUtils.hedronFromGeometryData(
      GeometryUtils.generateIcosahedronGeometryData(20)
    )
    // { name, edges } as GeometryData)
  );

  readonly model: Observable<HedronGroup>;

  constructor() {
    this.model = this.hedron$.pipe(map(HedronGroup.ofHedron), shareReplay(1));
  }

  setHedron(hedron: Hedron) {
    this.hedron$.next(hedron);
  }
}
