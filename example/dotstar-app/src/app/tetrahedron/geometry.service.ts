import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TetrahedronConfigOptions, Tetrahedron } from './lib';
import { shareReplay, map } from 'rxjs/operators';

@Injectable()
export class GeometryService {
  private readonly tetraConfigOptions$ = new BehaviorSubject<TetrahedronConfigOptions>({
    pixelsPerEdge: 96,
    edgePadding: 5,
    paddedEdgeLength: 1010,
  });

  readonly tetra: Observable<Tetrahedron>;

  constructor() {
    this.tetra = this.tetraConfigOptions$.pipe(
      map(configOptions => Tetrahedron.fromConfigOptions(configOptions)),
      shareReplay(1)
    );
  }
}
