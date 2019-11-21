import { Group } from 'three';
import { Tetrahedron } from '../lib';
import { PixelModel } from './pixel.model';

export class TetrahedronModel extends Group {


  constructor(
    readonly tetra: Tetrahedron
  ) {
    super();

    this.tetra.pixels.forEach(pixel => {
      const model = new PixelModel(pixel);

      this.add(model);
    });
  }
}
