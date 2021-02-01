export type Vertex = [x: number, y: number, z: number];
export type EdgeData = [v0: Vertex, v1: Vertex, n: number];

export interface GeometryData {
  name: string;
  edges: EdgeData[];
}
