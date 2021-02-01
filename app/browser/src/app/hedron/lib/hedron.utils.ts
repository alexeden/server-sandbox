import { Line3, Vector3 } from 'three';
import { GeometryData } from './geometry.types';
import { Hedron } from './hedron.types';

export class HedronUtils {
  static hedronFromGeometryData({
    name,
    edges: edgeData,
  }: GeometryData): Hedron {
    const edges = edgeData.map(([vertex0, vertex1, n], index) => {
      const v0 = new Vector3().fromArray(vertex0);
      const v1 = new Vector3().fromArray(vertex1);
      const midpoint = new Line3(v0, v1).getCenter(new Vector3(0, 0, 0));

      return {
        index,
        midpoint,
        leds: HedronUtils.ticks(v0, v1, n).map((p, edgeIndex) => ({
          p,
          edgeIndex,
          hedronIndex: 0,
          dOrigin: p.length(),
          dMidpoint: Math.abs(p.distanceTo(midpoint)),
        })),
        n,
        v0,
        v1,
      };
    });

    return {
      name,
      edges,
      n: edges.reduce((sum, { n }) => sum + n, 0),
    };
  }

  /**
   *    a                                                       b
   *    |---O---|---O---|---O---|---O---|---O---|---O---|---O---|
   *      n = 0                 |--seg->|                 n - 1
   */
  static ticks(a: Vector3, b: Vector3, n: number): Vector3[] {
    const mag = a.distanceTo(b);
    const dir = b.clone().sub(a).normalize();
    const seg = dir.clone().setLength(mag / n);
    const segMag = seg.length();
    const segHalf = dir.clone().setLength(segMag / 2);
    const v0 = a.clone().add(segHalf);

    return [...Array(n).keys()].map((_, i) =>
      v0.clone().add(seg.clone().setLength(i * segMag))
    );
  }
}
