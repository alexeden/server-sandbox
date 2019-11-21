import { Object3D, MeshPhongMaterial, Color, Mesh, SphereBufferGeometry } from 'three';
import { Pixel } from '../lib';

export class PixelModel extends Object3D {
  readonly mat: MeshPhongMaterial;
  readonly geo: SphereBufferGeometry;
  readonly mesh: Mesh;

  constructor(
    readonly pixel: Pixel
  ) {
    super();

    this.geo = new SphereBufferGeometry(3, 12, 12);

    this.mat = new MeshPhongMaterial({
      color: new Color('#00e4ff'),
    });

    this.mesh = new Mesh(this.geo, this.mat);
    this.add(this.mesh);
    this.position.copy(this.pixel.pos);
  }
}
