import { TetrahedronConfig, TetrahedronConfigOptions, Vertex, Edge, Pixel, EdgeRoute, VertexId as V } from './types';
import { Vector3, Line3 } from 'three';


export class TetrahedronUtils {
  static readonly sqrt2 = Math.sqrt(2);
  static readonly sqrt6 = Math.sqrt(6);
  static readonly tetrahedralAngle = Math.acos(-1 / 3);

  static configFromOptions(configOptions: TetrahedronConfigOptions): TetrahedronConfig {
    const { paddedEdgeLength, edgePadding, pixelsPerEdge } = configOptions;
    const edgeLength = paddedEdgeLength - 2 * edgePadding;
    const pixelsTotal = 6 * pixelsPerEdge;
    const pixelSpacing = edgeLength / pixelsPerEdge;
    const circumRadius = paddedEdgeLength / 4 * TetrahedronUtils.sqrt6;
    const midRadius = paddedEdgeLength / 4 * TetrahedronUtils.sqrt2;

    return {
      ...configOptions,
      edgeLength,
      pixelsPerEdge,
      pixelsTotal,
      pixelSpacing,
      circumRadius,
      midRadius,
    };
  }

  static verticesFromCircumRadius(circumRadius: number): Vertex[] {
    const A = new Vector3(0, circumRadius, 0);
    const B = A.clone().applyAxisAngle(new Vector3(1, 0, 0), TetrahedronUtils.tetrahedralAngle);
    const C = B.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);
    const D = C.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);

    return [A, B, C, D].map(pos => ({ pos }));
  }


  static edgeFromVertices(v0: Vertex, v1: Vertex, i: number): Edge {
    return {
      v0,
      v1,
      i,
      norm: new Line3(v0.pos, v1.pos).getCenter(new Vector3(0, 0, 0)),
    };
  }

  static pixelsFromEdge(edge: Edge, config: TetrahedronConfig): Pixel[] {
    return TetrahedronUtils.interpolateBetweenPoints(
      edge.v0.pos,
      edge.v1.pos,
      config.pixelsPerEdge,
      config.pixelSpacing,
      config.edgePadding
    )
    .map((pos, i) => ({
      edge,
      pos,
      i: config.pixelsPerEdge * edge.i + i,
    }));
  }

  static interpolateBetweenPoints(
    a: Vector3,
    b: Vector3,
    n: number,
    spacing: number,
    padding = 0
  ): Vector3[] {
    const dir = b.clone().sub(a).normalize();
    const p0 = a.clone().add(dir.clone().setLength(padding));

    return [...Array(n).keys()].map(
      (_, i) => p0.clone().add(dir.clone().setLength(i * spacing))
    );
  }

  static validateEdgeRoute(route: EdgeRoute) {
    const { A, B, C, D } = V;
    const allSegments = [[A, B], [A, C], [A, D], [B, C], [B, D], [C, D]].map(verts => verts.join(''));
    const providedSegments = route.map(verts => [...verts].sort().join(''));

    if ([...new Set(providedSegments)].length !== allSegments.length) {
      throw new Error(`Edge route contains a duplicate segment!`);
    }

    if (!providedSegments.every(seg => allSegments.includes(seg))) {
      throw new Error(`Edge route contains an invalid segment!`);
    }

    return true;
  }

  // static computeFromConfig(config: TetrahedronConfig): Tetrahedron {
  //   const { paddedEdgeLength, edgePadding, pixelsPerEdge } = config;
  //   const edgeLength = paddedEdgeLength - 2 * edgePadding;
  //   const pixelsTotal = 6 * pixelsPerEdge;
  //   const pixelSpacing = edgeLength / pixelsPerEdge;
  //   const circumRadius = paddedEdgeLength / 4 * sqrt6;
  //   const midRadius = paddedEdgeLength / 4 * sqrt2;

  //   const A = new Vector3(0, circumRadius, 0);
  //   const B = A.clone().applyAxisAngle(new Vector3(1, 0, 0), tetrahedralAngle);
  //   const C = B.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);
  //   const D = C.clone().applyAxisAngle(new Vector3(0, 1, 0), 2 * Math.PI / 3);

  //   return {
  //     ...config,
  //     edgeLength,
  //     pixelsPerEdge,
  //     pixelsTotal,
  //     pixelSpacing,
  //     circumRadius,
  //     midRadius,
  //     vertices: { A, B, C, D },
  //     edges: {
  //       AB: new Line3(A, B),
  //       AC: new Line3(A, C),
  //       AD: new Line3(A, D),
  //       BC: new Line3(B, C),
  //       BD: new Line3(B, D),
  //       CD: new Line3(C, D),
  //     },
  //     pixels: {
  //       AB: TetrahedronUtils.interpolateBetweenPoints(A, B, pixelsPerEdge, pixelSpacing, edgePadding),
  //       AC: TetrahedronUtils.interpolateBetweenPoints(A, C, pixelsPerEdge, pixelSpacing, edgePadding),
  //       AD: TetrahedronUtils.interpolateBetweenPoints(A, D, pixelsPerEdge, pixelSpacing, edgePadding),
  //       BC: TetrahedronUtils.interpolateBetweenPoints(B, C, pixelsPerEdge, pixelSpacing, edgePadding),
  //       BD: TetrahedronUtils.interpolateBetweenPoints(B, D, pixelsPerEdge, pixelSpacing, edgePadding),
  //       CD: TetrahedronUtils.interpolateBetweenPoints(C, D, pixelsPerEdge, pixelSpacing, edgePadding),
  //     },
  //   };
  // }
}
