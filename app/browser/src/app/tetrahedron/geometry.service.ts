import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { TetrahedronConfigOptions, Tetrahedron, VertexId as V } from './lib';
import { TetrahedronModel } from './models';
import { DotstarDeviceConfigService } from '@app/device-config.service';

@Injectable()
export class GeometryService {
  private readonly tetraConfigOptions$ = new BehaviorSubject<TetrahedronConfigOptions>(
    {
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
    }
  );

  readonly tetra: Observable<Tetrahedron>;
  readonly tetraModel: Observable<TetrahedronModel>;

  constructor(private configService: DotstarDeviceConfigService) {
    this.tetra = combineLatest(
      this.tetraConfigOptions$,
      this.configService.deviceConfig
    ).pipe(
      map(([configOptions, { length }]) =>
        Tetrahedron.fromConfigOptions({
          ...configOptions,
          pixelsPerEdge: length / 6,
        })
      ),
      shareReplay(1)
    );

    this.tetraModel = this.tetra.pipe(
      map(tetra => new TetrahedronModel(tetra)),
      shareReplay(1)
    );
  }
}
