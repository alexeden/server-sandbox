import { Injectable } from '@angular/core';
import { DotstarDeviceConfigService } from '@app/device-config.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {
  TetrahedronConfigOptions,
  TetrahedronGroup,
  VertexId as V,
} from './lib';

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

  readonly tetraModel: Observable<TetrahedronGroup>;

  constructor(private configService: DotstarDeviceConfigService) {
    this.tetraModel = combineLatest(
      this.tetraConfigOptions$,
      this.configService.deviceConfig
    ).pipe(
      map(([configOptions, { length }]) =>
        TetrahedronGroup.fromConfigOptions({
          ...configOptions,
          pixelsPerEdge: length / 6,
        })
      ),
      shareReplay(1)
    );
  }
}
