import { clampLoop } from '@app/lib';
import {
  Color,
  Group,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  SphereBufferGeometry,
} from 'three';
import { GeometryData } from './geometry.types';
import { Edge, Hedron, Led } from './hedron.types';
import { HedronUtils } from './hedron.utils';

export class LedModel extends Object3D {
  private readonly mat: MeshPhongMaterial;
  private readonly geo: SphereBufferGeometry;
  private readonly mesh: Mesh;

  static fromLed(led: Led): LedModel {
    return new LedModel(led);
  }

  private constructor(readonly data: Led) {
    super();

    this.geo = new SphereBufferGeometry(5, 12, 12);

    this.mat = new MeshPhongMaterial({
      color: new Color().setHSL(
        clampLoop(0, 0xff, this.data.edgeIndex),
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
    this.position.copy(this.data.position);
  }

  setColor(color: Color) {
    this.mat.color = color;
  }
}

export class HedronGroup extends Group {
  readonly leds: LedModel[];
  readonly edges: Edge[];

  static fromGeoData(geoData: GeometryData): HedronGroup {
    return new HedronGroup(HedronUtils.hedronFromGeometryData(geoData));
  }

  private constructor({ name, edges, n }: Hedron) {
    super();
    this.name = name;
    this.edges = edges;
    this.leds = this.edges.flatMap(edge => edge.leds.map(LedModel.fromLed));
    this.add(...this.leds);
  }

  applyColors(colors: Color[]) {
    colors.forEach((color, i) => this.leds[i].setColor(color));
  }
}
