import {
  Color,
  Group,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereBufferGeometry,
} from 'three';
import {
  Edge,
  Pixel,
  TetrahedronConfig,
  TetrahedronConfigOptions,
  Vertex,
} from './tetrahedron.types';
import { TetrahedronUtils } from './tetrahedron.utils';

export class PixelModel extends Object3D {
  readonly mat: MeshPhongMaterial;
  readonly geo: SphereBufferGeometry;
  readonly mesh: Mesh;

  constructor(readonly config: TetrahedronConfig, readonly pixel: Pixel) {
    super();

    this.geo = new SphereBufferGeometry(5, 12, 12);

    this.mat = new MeshPhongMaterial({
      color: new Color().setHSL(
        this.pixel.index / this.config.pixelsTotal,
        1,
        0.5
      ),
      shininess: 100,
      emissive: 0x000000,
      specular: 0x000000,
      fog: true,
    });

    this.mesh = new Mesh(this.geo, this.mat);
    this.add(this.mesh);
    this.position.copy(this.pixel.position);
  }

  setColor(color: Color) {
    this.mat.color = color;
  }
}

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
