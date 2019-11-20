import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TetrahedronConfig, Tetrahedron, TetrahedronConfigOptions } from './lib';
import { shareReplay, map } from 'rxjs/operators';
import { TetrahedronUtils } from './lib/utils';

@Injectable()
export class GeometryService {
  private readonly tetraConfigOptions$ = new BehaviorSubject<TetrahedronConfigOptions>({
    pixelsPerEdge: 96,
    edgePadding: 5,
    paddedEdgeLength: 1010,
  });

  readonly tetraConfig: Observable<TetrahedronConfig>;

  constructor() {
    this.tetraConfig = this.tetraConfigOptions$.pipe(
      map(options => TetrahedronUtils.configFromOptions(options)),
      shareReplay(1)
    );
  }
}
