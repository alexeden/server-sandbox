import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TetrahedronConfig, Tetrahedron } from './lib';
import { shareReplay, map } from 'rxjs/operators';
import { TetrahedronUtils } from './lib/utils';

@Injectable()
export class GeometryService {
  private readonly tetraConfig$ = new BehaviorSubject<TetrahedronConfig>({
    density: 96 / 1000,
    edgePadding: 5,
    paddedEdgeLength: 1010,
  });

  readonly tetra: Observable<Tetrahedron>;

  constructor() {
    this.tetra = this.tetraConfig$.pipe(
      map(config => TetrahedronUtils.computeFromConfig(config)),
      shareReplay(1)
    );
  }
}
