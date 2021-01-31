import { Color, Mesh, MeshPhongMaterial, Object3D, SphereBufferGeometry } from 'three';
import { Pixel, TetrahedronConfig } from '../lib';

export class PixelModel extends Object3D {
  readonly mat: MeshPhongMaterial;
  readonly geo: SphereBufferGeometry;
  readonly mesh: Mesh;

  constructor(
    readonly config: TetrahedronConfig,
    readonly pixel: Pixel
  ) {
    super();

    this.geo = new SphereBufferGeometry(5, 12, 12);

    this.mat = new MeshPhongMaterial({
      color: new Color().setHSL(this.pixel.index / this.config.pixelsTotal, 1, 0.5),
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
