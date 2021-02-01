import { Color, Group } from 'three';
import { PixelModel } from './pixel.object3d';
import {
  Edge,
  Pixel,
  TetrahedronConfig,
  TetrahedronConfigOptions,
  Vertex,
} from './types';
import { TetrahedronUtils } from './utils';

export class TetrahedronGroup extends Group {
  readonly pixelModels: PixelModel[];
  readonly vertices: Vertex[];
  readonly edges: Edge[];
  readonly pixels: Pixel[];

  static fromConfigOptions(
    configOptions: TetrahedronConfigOptions
  ): TetrahedronGroup {
    // Validate the edge route first
    TetrahedronUtils.validateEdgeRoute(configOptions.edgeRoute);

    return new TetrahedronGroup(
      TetrahedronUtils.configFromOptions(configOptions)
    );
  }

  constructor(readonly config: TetrahedronConfig) {
    super();
    this.vertices = TetrahedronUtils.verticesFromCircumRadius(
      this.config.circumRadius
    );

    this.edges = this.config.edgeRoute.map(([vId0, vId1], i) =>
      TetrahedronUtils.edgeFromVertices(
        this.vertices[vId0],
        this.vertices[vId1],
        i
      )
    );

    this.pixels = this.edges.flatMap(edge =>
      TetrahedronUtils.pixelsFromEdge(edge, this.config)
    );

    this.pixelModels = this.pixels.map(pixel => {
      const model = new PixelModel(this.config, pixel);
      this.add(model);

      return model;
    });
  }

  applyColors(colors: Color[]) {
    colors.forEach((color, i) => this.pixelModels[i].setColor(color));
  }
}
