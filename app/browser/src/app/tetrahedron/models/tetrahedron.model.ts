import { Color, Group } from 'three';
import { Tetrahedron } from '../lib';
import { PixelModel } from './pixel.model';

export class TetrahedronModel extends Group {
  readonly pixelModels: PixelModel[];

  constructor(
    readonly tetra: Tetrahedron
  ) {
    super();

    this.pixelModels = this.tetra.pixels.map(pixel => {
      const model = new PixelModel(this.tetra.config, pixel);
      this.add(model);

      return model;
    });
  }

  applyColors(colors: Color[]) {
    colors.forEach((color, i) => this.pixelModels[i].setColor(color));
  }
}
