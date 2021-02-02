// import { clampLoop } from '@app/lib';
import {
  Color,
  Group,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereBufferGeometry,
} from 'three';
import { Edge, Hedron, Led } from './hedron.types';

export class LedModel extends Object3D {
  private readonly mat: MeshPhongMaterial;
  private readonly geo: SphereBufferGeometry;
  private readonly mesh: Mesh;

  static fromLed(led: Led, edge: Edge): LedModel {
    return new LedModel(led, edge);
  }

  private constructor(readonly data: Led, readonly parentEdge: Edge) {
    super();

    this.geo = new SphereBufferGeometry(0.01, 12, 12);
    // const color = new Color().setHSL(
    //   // clampLoop(0, 255, this.data.edgeIndex) / 0xff,
    //   0.5,
    //   1,
    //   0.5
    // );

    this.mat = new MeshPhongMaterial({
      color: new Color(),
      shininess: 100,
      emissive: 0x000000,
      specular: 0x000000,
      fog: true,
    });

    this.mesh = new Mesh(this.geo, this.mat);
    this.add(this.mesh);
    this.position.copy(this.data.position);
  }

  setColor(color: Color) {
    this.mat.color = color;
  }
}

export class HedronGroup extends Group {
  readonly leds: LedModel[];
  readonly edges: Edge[];

  static ofHedron(hedron: Hedron): HedronGroup {
    return new HedronGroup(hedron);
  }

  private constructor({ name, edges, n }: Hedron) {
    super();
    this.name = name;
    this.edges = edges;
    this.leds = this.edges.flatMap(edge =>
      edge.leds.map(led => LedModel.fromLed(led, edge))
    );
    this.add(...this.leds);
  }

  applyColors(colors: Color[]) {
    colors.forEach((color, i) => this.leds[i].setColor(color));
  }
}
