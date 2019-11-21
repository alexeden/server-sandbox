import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { TetrahedronConfigOptions, Tetrahedron, VertexId as V } from './lib';

@Injectable()
export class GeometryService {
  private readonly tetraConfigOptions$ = new BehaviorSubject<TetrahedronConfigOptions>({
    edgeRoute: [
      [V.A, V.B],
      [V.B, V.C],
      [V.C, V.A],
      [V.A, V.D],
      [V.D, V.C],
      [V.B, V.D],
    ],
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
