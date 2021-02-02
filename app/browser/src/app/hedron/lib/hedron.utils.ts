import { Line3, Vector3 } from 'three';
import { GeometryData } from './geometry.types';
import { Hedron } from './hedron.types';

export class HedronUtils {
  static hedronFromGeometryData({
    name,
    edges: edgeData,
  }: GeometryData): Hedron {
    const n = edgeData.reduce((sum, [, , n]) => sum + n, 0);
    const edges = edgeData.map(([vertex0, vertex1, edgeN], index) => {
      const v0 = new Vector3().fromArray(vertex0);
      const v1 = new Vector3().fromArray(vertex1);
      const midpoint = new Line3(v0, v1).getCenter(new Vector3(0, 0, 0));

      return {
        index,
        midpoint,
        leds: HedronUtils.ticks(v0, v1, edgeN).map((position, edgeIndex) => ({
          position,
          edgeIndex,
          index: 0,
          n,
          dOrigin: position.length(),
          dMidpoint: Math.abs(position.distanceTo(midpoint)),
        })),
        n,
        edgeN,
        v0,
        v1,
      };
    });

    return {
      name,
      edges,
      n,
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
