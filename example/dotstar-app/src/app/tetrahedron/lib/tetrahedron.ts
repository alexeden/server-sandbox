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

    this.vertices = TetrahedronUtils.verticesFromCircumRadius(this.config.circumRadius);

    this.edges = this.config.edgeRoute.map(([vId0, vId1], i) =>
      TetrahedronUtils.edgeFromVertices(this.vertices[vId0], this.vertices[vId1], i)
    );

    this.pixels = this.edges.flatMap(edge => TetrahedronUtils.pixelsFromEdge(edge, this.config));
  }
}
