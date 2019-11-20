import { TetrahedronConfigOptions } from '.';
import { TetrahedronConfig, Vertex, Edge, Pixel } from './types';
import { TetrahedronUtils } from './utils';

export class Tetrahedron {
  static fromConfigOptions(configOptions: TetrahedronConfigOptions): Tetrahedron {
    return new Tetrahedron(TetrahedronUtils.configFromOptions(configOptions));
  }

  readonly vertices: Vertex[];
  readonly edges: Edge[];
  readonly pixels: Pixel[];


  private constructor(
    readonly config: TetrahedronConfig
  ) {
    this.vertices = TetrahedronUtils.verticesFromConfig(this.config);
    const [ A, B, C, D ] = this.vertices;

    this.edges = [...Array(6).keys()].flatMap(i => [
      TetrahedronUtils.edgeFromVertices(A, B, i),
      TetrahedronUtils.edgeFromVertices(A, C, i),
      TetrahedronUtils.edgeFromVertices(A, D, i),
      TetrahedronUtils.edgeFromVertices(B, C, i),
      TetrahedronUtils.edgeFromVertices(B, D, i),
      TetrahedronUtils.edgeFromVertices(C, D, i),
    ]);

    this.pixels = this.edges.flatMap(edge => TetrahedronUtils.pixelsFromEdge(edge, this.config));
  }
}
