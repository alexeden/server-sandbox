import { Group } from 'three';
import { Tetrahedron } from '../lib';
import { PixelModel } from './pixel.model';

export class TetrahedronModel extends Group {


  constructor(
    readonly tetra: Tetrahedron
  ) {
    super();

    (window as any).tetModel = this;

    this.tetra.pixels.forEach(pixel => {
      const model = new PixelModel(pixel);

      this.add(model);
    });
  }
}
