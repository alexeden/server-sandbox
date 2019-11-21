import { Group, LineBasicMaterial, Geometry, Vector3, Line } from 'three';
import { Tetrahedron, colors } from '../lib';
import { PixelModel } from './pixel.model';

export class TetrahedronModel extends Group {


  constructor(
    readonly tetra: Tetrahedron
  ) {
    super();

    (window as any).tetModel = this;

    this.tetra.edges.forEach(edge => {
      const lineMat = new LineBasicMaterial({
        color: colors.green,
      });

      const geometry = new Geometry();
      geometry.vertices.push(
        new Vector3(0, 0, 0),
        edge.norm
      );

      this.add(new Line(geometry, lineMat));
    });

    this.tetra.pixels.forEach(pixel => {
      const model = new PixelModel(pixel);

      this.add(model);
    });
  }
}
