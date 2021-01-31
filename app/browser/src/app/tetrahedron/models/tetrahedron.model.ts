import { Color, Group } from 'three';
import { Tetrahedron } from '../lib';
import { PixelModel } from './pixel.model';

export class TetrahedronModel extends Group {
  readonly pixelModels: PixelModel[];

  constructor(
    readonly tetra: Tetrahedron
  ) {
    super();

    (window as any).tetModel = this;

    // this.tetra.edges.forEach(edge => {
    //   const lineMat = new LineBasicMaterial({
    //     color: colors.green,
    //   });

    //   const geometry = new Geometry();
    //   geometry.vertices.push(
    //     new Vector3(0, 0, 0),
    //     edge.norm
    //   );

    //   this.add(new Line(geometry, lineMat));
    // });

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
