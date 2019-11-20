import { TetrahedronConfigOptions } from '.';
import { TetrahedronConfig, Vertex, Edge, Pixel } from './types';
import { TetrahedronUtils } from './utils';

export class Tetrahedron {
  static fromConfigOptions(configOptions: TetrahedronConfigOptions): Tetrahedron {
    return new Tetrahedron(TetrahedronUtils.configFromOptions(configOptions));
  }

  readonly vertices: Vertex[];
  /**
   *
   */
  readonly edges: Edge[];
  /**
   *
   */
  readonly pixels: Pixel[];


  private constructor(
    readonly config: TetrahedronConfig
  ) {

  }
}
