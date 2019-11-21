import { TetrahedronConfigOptions } from '.';
import { TetrahedronConfig, Vertex, Edge, Pixel } from './types';
import { TetrahedronUtils } from './utils';

export class Tetrahedron {
  static fromConfigOptions(configOptions: TetrahedronConfigOptions): Tetrahedron {
    // Validate the edge route first
    TetrahedronUtils.validateEdgeRoute(configOptions.edgeRoute);

    return new Tetrahedron(TetrahedronUtils.configFromOptions(configOptions));
  }

  readonly vertices: Vertex[];
  readonly edges: Edge[];
  readonly pixels: Pixel[];


  private constructor(
    readonly config: TetrahedronConfig
  ) {
    (window as any).tet = this;
    this.vertices = TetrahedronUtils.verticesFromConfig(this.config);
    const [ A, B, C, D ] = this.vertices;

    this.edges = [
      TetrahedronUtils.edgeFromVertices(A, B, 0),
      TetrahedronUtils.edgeFromVertices(A, C, 1),
      TetrahedronUtils.edgeFromVertices(A, D, 2),
      TetrahedronUtils.edgeFromVertices(B, C, 3),
      TetrahedronUtils.edgeFromVertices(B, D, 4),
      TetrahedronUtils.edgeFromVertices(C, D, 5),
    ];

    this.pixels = this.edges.flatMap(edge => TetrahedronUtils.pixelsFromEdge(edge, this.config));
  }
}
